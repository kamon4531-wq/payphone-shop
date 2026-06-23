import jwt from "jsonwebtoken";
import crypto from "crypto";
import { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export type UserRole = "owner" | "hq_admin" | "region_manager" | "branch";

export type UserPayload = {
  id?: number;
  username: string;
  role: UserRole;
  branch_code?: string | null;
  region_code?: string | null;
  full_name?: string | null;
};

export function signToken(payload: UserPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string | undefined): UserPayload | null {
  if (!token) return null;
  try { return jwt.verify(token, SECRET) as UserPayload; } catch { return null; }
}

export function getUser(req: NextRequest): UserPayload | null {
  const t = req.cookies.get("admin_token")?.value;
  return verifyToken(t);
}

export function isAdmin(req: NextRequest) {
  return !!getUser(req);
}

export function isOwner(req: NextRequest) {
  return getUser(req)?.role === "owner";
}

export function canSeeAllBranches(role: UserRole) {
  return role === "owner" || role === "hq_admin";
}

// Password hashing (PBKDF2)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return verify === hash;
  } catch { return false; }
}
