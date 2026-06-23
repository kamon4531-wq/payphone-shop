import { NextRequest, NextResponse } from "next/server";
import { signToken, verifyPassword, hashPassword, UserPayload } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // 1) ลองหาใน admin_users
  const { data: user } = await admin.from("admin_users")
    .select("*").eq("username", username).eq("enabled", true).single();

  let payload: UserPayload | null = null;

  if (user) {
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "wrong" }, { status: 401 });
    }
    payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      branch_code: user.branch_code,
      region_code: user.region_code,
      full_name: user.full_name
    };
    // update last_login_at
    await admin.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
  } else {
    // 2) Fallback: ENV admin (สำหรับ migrate)
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;
    if (envUser && envPass && username === envUser && password === envPass) {
      // Auto-create owner ใน DB
      const hash = hashPassword(password);
      const { data: newUser } = await admin.from("admin_users").insert({
        username: envUser,
        password_hash: hash,
        role: "owner",
        full_name: "Owner",
        enabled: true
      }).select().single();
      
      if (newUser) {
        payload = {
          id: newUser.id,
          username: newUser.username,
          role: "owner",
          full_name: "Owner"
        };
      } else {
        // ใช้ payload ชั่วคราว ถ้า insert ล้มเหลว
        payload = { username: envUser, role: "owner" };
      }
    }
  }

  if (!payload) return NextResponse.json({ error: "wrong" }, { status: 401 });

  const token = signToken(payload);
  const res = NextResponse.json({ ok: true, user: payload });
  res.cookies.set("admin_token", token, {
    httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/"
  });
  return res;
}
