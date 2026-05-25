import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
