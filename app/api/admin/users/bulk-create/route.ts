import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser, hashPassword } from "@/lib/auth";
import { BRANCHES } from "@/lib/types";

function genPassword(len = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < len; i++) {
    p += chars[Math.floor(Math.random() * chars.length)];
  }
  return p;
}

export async function POST(req: NextRequest) {
  const u = getUser(req);
  if (u?.role !== "owner") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const mode = body.mode || "create"; // create | reset

  const admin = supabaseAdmin();
  const result: any[] = [];

  // Region Managers
  for (const region of ["R1", "R2", "R3", "R4"]) {
    const username = `${region.toLowerCase()}mgr`;
    const password = genPassword(10);
    const hash = hashPassword(password);

    const { data: existing } = await admin.from("admin_users").select("id").eq("username", username).single();
    
    if (existing) {
      if (mode === "reset") {
        await admin.from("admin_users").update({ password_hash: hash, enabled: true }).eq("id", existing.id);
        result.push({ username, password, role: "region_manager", region_code: region, full_name: `Region Manager ${region}`, status: "reset" });
      } else {
        result.push({ username, password: "(ไม่เปลี่ยน)", role: "region_manager", region_code: region, full_name: `Region Manager ${region}`, status: "exists" });
      }
    } else {
      await admin.from("admin_users").insert({
        username, password_hash: hash, role: "region_manager",
        region_code: region, full_name: `Region Manager ${region}`, enabled: true
      });
      result.push({ username, password, role: "region_manager", region_code: region, full_name: `Region Manager ${region}`, status: "created" });
    }
  }

  // Branches
  for (const b of BRANCHES) {
    const code = b.name.split(":")[0];
    const username = code.toLowerCase();
    const password = genPassword(10);
    const hash = hashPassword(password);
    const fullName = b.name.split(":")[1] || b.name;

    const { data: existing } = await admin.from("admin_users").select("id").eq("username", username).single();
    
    if (existing) {
      if (mode === "reset") {
        await admin.from("admin_users").update({ password_hash: hash, enabled: true }).eq("id", existing.id);
        result.push({ username, password, role: "branch", branch_code: code, region_code: b.region, full_name: fullName, status: "reset" });
      } else {
        result.push({ username, password: "(ไม่เปลี่ยน)", role: "branch", branch_code: code, region_code: b.region, full_name: fullName, status: "exists" });
      }
    } else {
      await admin.from("admin_users").insert({
        username, password_hash: hash, role: "branch",
        branch_code: code, region_code: b.region, full_name: fullName, enabled: true
      });
      result.push({ username, password, role: "branch", branch_code: code, region_code: b.region, full_name: fullName, status: "created" });
    }
  }

  return NextResponse.json({ result, total: result.length });
}
