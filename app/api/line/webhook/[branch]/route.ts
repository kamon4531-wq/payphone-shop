import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: { branch: string } }) {
  const branch = (params.branch || "").toUpperCase();
  const body = await req.json().catch(() => ({}));
  const events = body.events || [];

  const admin = supabaseAdmin();
  const { data: settings } = await admin
    .from("branch_line_settings")
    .select("channel_access_token, branch_code")
    .eq("branch_code", branch)
    .single();

  if (!settings) return NextResponse.json({ ok: true, ignored: "branch not configured" });

  for (const ev of events) {
    if (ev.type !== "message" || ev.message?.type !== "text") continue;
    const text = (ev.message.text || "").trim().toLowerCase();
    const userId = ev.source?.userId;
    const replyToken = ev.replyToken;
    if (!userId) continue;

    let replyText = "";

    if (text === "register" || text === "ลงทะเบียน") {
      await admin
        .from("branch_line_settings")
        .update({ recipient_id: userId, enabled: true })
        .eq("branch_code", branch);
      replyText = `✅ ลงทะเบียนรับแจ้งเตือนสำเร็จ\n\nสาขา: ${branch}\nUser ID: ${userId.slice(0, 8)}...\n\nคุณจะได้รับแจ้งเตือนทุกครั้งที่มีออเดอร์ใหม่`;
    } else if (text === "unregister" || text === "ยกเลิก") {
      await admin
        .from("branch_line_settings")
        .update({ recipient_id: null })
        .eq("branch_code", branch);
      replyText = `🚫 ยกเลิกการรับแจ้งเตือนแล้ว\nสาขา: ${branch}`;
    } else if (text === "status" || text === "เช็ค") {
      const { data: s } = await admin
        .from("branch_line_settings")
        .select("recipient_id, enabled")
        .eq("branch_code", branch)
        .single();
      const isMe = s?.recipient_id === userId;
      replyText = `สถานะ\nสาขา: ${branch}\nคุณรับแจ้งเตือน: ${isMe ? "✅ ใช่" : "❌ ไม่ใช่"}\nระบบเปิดใช้: ${s?.enabled ? "✅" : "❌"}\n\nพิมพ์ register เพื่อรับ\nพิมพ์ unregister เพื่อยกเลิก`;
    } else {
      replyText = `📦 ระบบแจ้งเตือนออเดอร์ PA.PHONE\nสาขา: ${branch}\n\nคำสั่ง:\n• register - รับแจ้งเตือนออเดอร์\n• unregister - ยกเลิก\n• status - เช็คสถานะ`;
    }

    if (replyToken && replyText) {
      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.channel_access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          replyToken,
          messages: [{ type: "text", text: replyText }]
        })
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, info: "Line webhook endpoint" });
}
