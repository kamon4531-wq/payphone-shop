import { supabaseAdmin } from "@/lib/supabase";

export async function notifyBranch(branchCode: string, message: string) {
  try {
    const { data } = await supabaseAdmin()
      .from("branch_line_settings")
      .select("channel_access_token, recipient_id, enabled")
      .eq("branch_code", branchCode)
      .single();

    if (!data || !data.enabled) {
      console.log(`Line notify skipped for ${branchCode} (not enabled)`);
      return { ok: false, reason: "not_enabled" };
    }

    const endpoint = data.recipient_id
      ? "https://api.line.me/v2/bot/message/push"
      : "https://api.line.me/v2/bot/message/broadcast";

    const body: any = {
      messages: [{ type: "text", text: message }]
    };
    if (data.recipient_id) body.to = data.recipient_id;

    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.channel_access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const err = await r.text();
      console.error(`Line notify failed for ${branchCode}:`, err);
      return { ok: false, error: err };
    }

    return { ok: true };
  } catch (e: any) {
    console.error("Line notify error:", e.message);
    return { ok: false, error: e.message };
  }
}
