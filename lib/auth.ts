import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string | undefined): any {
  if (!token) return null;
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export function isAdmin(req: NextRequest) {
  const t = req.cookies.get("admin_token")?.value;
  return !!verifyToken(t);
}
