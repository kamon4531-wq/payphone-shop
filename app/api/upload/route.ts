import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

  const buf = Buffer.from(await file.arrayBuffer());
  const blob = new Blob([buf], { type: file.type });

  const uploadForm = new FormData();
  uploadForm.append("file", blob);
  uploadForm.append("api_key", apiKey);
  uploadForm.append("timestamp", String(timestamp));
  uploadForm.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadForm
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "upload failed: " + err }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ id: data.public_id, url: data.secure_url });
}
