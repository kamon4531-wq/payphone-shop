import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { notifyBranch } from "@/lib/lineNotify";

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const body = await req.json();
    if (!body.branch_code) return NextResponse.json({ ok: false, error: "branch_code required" }, { status: 400 });
    
    const message = `🧪 ทดสอบระบบแจ้งเตือนออเดอร์\n\nสาขา: ${body.branch_code}\nเวลา: ${new Date().toLocaleString("th-TH")}\n\nถ้าเห็นข้อความนี้ = ระบบทำงานปกติ!`;
    
    const result = await notifyBranch(body.branch_code, message);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "server error" }, { status: 500 });
  }
}
