import { supabaseAdmin } from "@/lib/supabase";

export async function notifyBranch(branchCode: string, message: string) {
  try {
    const { data, error: dbErr } = await supabaseAdmin()
      .from("branch_line_settings")
      .select("channel_access_token, recipient_id, enabled")
      .eq("branch_code", branchCode)
      .single();

    if (dbErr) return { ok: false, error: `DB: ${dbErr.message}` };
    if (!data) return { ok: false, error: "ไม่พบการตั้งค่าของสาขา" };
    if (!data.enabled) return { ok: false, error: "ปิดใช้งานอยู่" };

    const endpoint = data.recipient_id
      ? "https://api.line.me/v2/bot/message/push"
      : "https://api.line.me/v2/bot/message/broadcast";

    const body: any = { messages: [{ type: "text", text: message }] };
    if (data.recipient_id) body.to = data.recipient_id;

    // Timeout 10 sec
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.channel_access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!r.ok) {
      const errText = await r.text();
      return { ok: false, error: `Line API ${r.status}: ${errText}` };
    }

    return { ok: true };
  } catch (e: any) {
    if (e.name === "AbortError") return { ok: false, error: "timeout (10s)" };
    return { ok: false, error: e.message || "unknown" };
  }
}
