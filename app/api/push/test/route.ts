import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import webpush from "web-push";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails("mailto:admin@payphone.example", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = supabaseAdmin();
  let query = admin.from("push_subscriptions").select("*");
  if (user.role === "branch" && user.branch_code) query = query.eq("branch_code", user.branch_code);
  else query = query.eq("username", user.username);

  const { data: subs } = await query;
  if (!subs || subs.length === 0) return NextResponse.json({ error: "no subscriptions" }, { status: 404 });

  let sent = 0, failed = 0;
  const errors: string[] = [];

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title: "🧪 Test Push", body: "ถ้าเห็นข้อความนี้ = Push ทำงาน!", url: "/admin" })
      );
      sent++;
    } catch (e: any) {
      failed++;
      errors.push((e.statusCode || "?") + ": " + (e.body || e.message || "error"));
    }
  }

  return NextResponse.json({ sent, failed, errors, total: subs.length });
}
