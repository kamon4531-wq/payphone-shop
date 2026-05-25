import { google } from "googleapis";
import { Readable } from "stream";

export function driveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"]
  });
  return google.drive({ version: "v3", auth });
}

export async function uploadToDrive(buffer: Buffer, name: string, mimeType: string) {
  const drive = driveClient();
  const res = await drive.files.create({
    requestBody: {
      name,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined
    },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id"
  });
  const id = res.data.id!;
  await drive.permissions.create({
    fileId: id,
    requestBody: { role: "reader", type: "anyone" }
  });
  return {
    id,
    url: `https://lh3.googleusercontent.com/d/${id}`
  };
}
