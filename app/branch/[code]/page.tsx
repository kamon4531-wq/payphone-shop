"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { BRANCHES } from "@/lib/types";

const FALLBACK_LINE_OA = "@050hfvcn";

export default function BranchPage() {
  const params = useParams();
  const code = params.code as string;
  const branch = BRANCHES.find(b => b.name.startsWith(code + ":"));

  useEffect(() => {
    if (branch) {
      localStorage.setItem("selectedBranch", branch.name);
    }
  }, [branch]);

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-6 text-center max-w-md">
          <div className="text-5xl mb-3">❌</div>
          <h1 className="text-xl font-bold mb-2">ไม่พบสาขา</h1>
          <p className="text-sm text-gray-600 mb-4">รหัสสาขา: {code}</p>
          <a href="/" className="text-emerald-500 underline">กลับหน้าหลัก</a>
        </div>
      </div>
    );
  }

  const registerUrl = `http://183.88.225.82:81/PAMember/register/${code}`;
  const lineOaId = branch.line_oa_id || FALLBACK_LINE_OA;
  const lineUrl = `https://line.me/R/ti/p/${lineOaId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="text-6xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold mb-1">ยินดีต้อนรับ</h1>
        <div className="bg-emerald-100 text-emerald-800 inline-block px-3 py-1 rounded-full text-xs font-semibold my-2">
          {branch.region}
        </div>
        <p className="text-gray-700 font-medium mb-1">{branch.name}</p>
        <p className="text-sm text-gray-500 mb-6">ขอบคุณที่ใช้บริการของเรา</p>

        <a href={registerUrl} target="_blank" rel="noreferrer"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg mb-3 shadow">
          📝 สมัครสมาชิก PA Member
        </a>

        <a href={lineUrl} target="_blank" rel="noreferrer"
          className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg mb-3 shadow">
          ➕ เพิ่มเพื่อน Line OA สาขา
        </a>

        <a href="/" className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg mb-3 shadow">
          🛒 ดูสินค้าราคาพิเศษ
        </a>

        <p className="text-xs text-gray-400 mt-6">PAY BY PA.PHONE</p>
      </div>
    </div>
  );
}
