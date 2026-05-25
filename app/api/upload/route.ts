import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/googleDrive";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${file.name}`;
  const { id, url } = await uploadToDrive(buf, name, file.type || "image/jpeg");
  return NextResponse.json({ id, url });
}
