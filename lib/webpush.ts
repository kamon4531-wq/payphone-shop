import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@payphone.example",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export async function sendPushToBranch(branchCode: string, payload: PushPayload) {
  const admin = supabaseAdmin();
  // ส่งให้ทั้งเครื่องของสาขานั้น และแอดมินกลาง (branch_code = null) เพื่อให้แอดมินกลางได้รับแจ้งเตือนทุกออเดอร์
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("*")
    .or(`branch_code.eq.${branchCode},branch_code.is.null`);

  if (!subs || subs.length === 0) return;

  await Promise.all(
    subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          JSON.stringify(payload)
        );
      } catch (e: any) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    })
  );
}

export async function sendPushToAll(payload: PushPayload) {
  const admin = supabaseAdmin();
  const { data: subs } = await admin.from("push_subscriptions").select("*");
  if (!subs) return;
  await Promise.all(
    subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch {}
    })
  );
}
