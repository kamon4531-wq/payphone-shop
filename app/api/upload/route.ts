import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

const OWNER = "kamon4531-wq";
const REPO = "payphone-images";
const BRANCH = "main";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "file too large (max 10MB)" }, { status: 400 });
  }

  const token = process.env.GITHUB_IMAGE_TOKEN!;
  const ext = ((file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "")) || "png";
  const id = crypto.randomBytes(12).toString("hex");
  const filename = `${id}.${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const contentB64 = buf.toString("base64");

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filename}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "payphone-upload",
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `upload ${filename}`,
        content: contentB64,
        branch: BRANCH,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "upload failed: " + err }, { status: 500 });
  }

  const data = await res.json();
  const sha = data.commit?.sha || BRANCH;
  const url = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${sha}/${filename}`;
  return NextResponse.json({ id, url });
}
