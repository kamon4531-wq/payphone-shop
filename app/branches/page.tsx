"use client";
import { useState } from "react";
import { BRANCHES } from "@/lib/types";

// ชื่อค้นหา Google Maps ที่แม่นยำสำหรับแต่ละสาขา
const MAP_QUERY: Record<string, string> = {
  // R1
  "B02": "เซ็นทรัลพลาซา ขอนแก่น",
  "B07": "สุรินทร์พลาซ่า",
  "B08": "โรบินสัน ไลฟ์สไตล์ สกลนคร",
  "B17": "เดอะมอลล์ นครราชสีมา",
  "B18": "เซ็นทรัลพลาซา อุดรธานี",
  "B22": "เซ็นทรัลพลาซา อุบลราชธานี",
  "B28": "ทวีกิจ คอมเพล็กซ์ บุรีรัมย์",
  "B31": "โรบินสัน ไลฟ์สไตล์ สุรินทร์",
  "B33": "โรบินสัน ไลฟ์สไตล์ ร้อยเอ็ด",
  "B38": "โรบินสัน ไลฟ์สไตล์ มุกดาหาร",
  "B43": "เสริมไทย คอมเพล็กซ์ มหาสารคาม",
  "B58": "เซ็นทรัลพลาซา นครราชสีมา",
  "B66": "โรบินสัน ไลฟ์สไตล์ ชัยภูมิ",
  "B74": "บิ๊กซี กาฬสินธุ์",
  // R2
  "B06": "บิ๊กซี นครสวรรค์",
  "B16": "โรบินสัน ไลฟ์สไตล์ สุพรรณบุรี",
  "B21": "เซ็นทรัลพลาซา ลำปาง",
  "B23": "โรบินสัน ไลฟ์สไตล์ กาญจนบุรี",
  "B26": "โรบินสัน ไลฟ์สไตล์ สระบุรี",
  "B27": "เซ็นทรัลเฟสติวัล เชียงใหม่",
  "B45": "ทวีกิจ พลาซ่า สระบุรี",
  "B46": "โรบินสัน ไลฟ์สไตล์ แม่สอด",
  "B53": "โรบินสัน ไลฟ์สไตล์ ลพบุรี",
  "B59": "โรบินสัน ไลฟ์สไตล์ กำแพงเพชร",
  "B68": "บิ๊กซี ลำพูน",
  "B83": "เซ็นทรัลพลาซา อยุธยา",
  "B87": "เซ็นทรัลพลาซา นครสวรรค์",
  "B88": "บิ๊กซี สระบุรี",
  // R3
  "B10": "ตึกคอม พัทยาใต้",
  "B11": "เซ็นทรัลพลาซา ชลบุรี",
  "B12": "โรบินสัน ไลฟ์สไตล์ ศรีราชา",
  "B13": "เซ็นทรัลเฟสติวัล พัทยาบีช",
  "B34": "โรบินสัน ไลฟ์สไตล์ ฉะเชิงเทรา",
  "B35": "แพชชั่น ช้อปปิ้ง เดสติเนชั่น ระยอง",
  "B36": "โรบินสัน ไลฟ์สไตล์ สมุทรปราการ",
  "B37": "โรบินสัน ไลฟ์สไตล์ ปราจีนบุรี",
  "B40": "เซ็นทรัล ระยอง",
  "B55": "โรบินสัน ไลฟ์สไตล์ จันทบุรี",
  "B64": "โรบินสัน ไลฟ์สไตล์ ชลบุรี",
  "B72": "โรบินสัน ไลฟ์สไตล์ สุวรรณภูมิ",
  "B81": "โรบินสัน ไลฟ์สไตล์ บ้านฉาง",
  "B82": "เซ็นทรัล ศรีราชา",
  "B84": "เซ็นทรัล จันทบุรี",
  // R4
  "B15": "เซ็นทรัลเฟสติวัล ภูเก็ต",
  "B20": "เซ็นทรัลพลาซา สุราษฎร์ธานี",
  "B30": "เซ็นทรัลเฟสติวัล หาดใหญ่",
  "B32": "เซ็นทรัลเฟสติวัล สมุย",
  "B44": "โรบินสัน ไลฟ์สไตล์ ศรีสมาน",
  "B49": "เซ็นทรัลพลาซา นครศรีธรรมราช",
  "B50": "โรบินสัน ไลฟ์สไตล์ ราชบุรี",
  "B51": "Bluport Hua Hin Resort Mall",
  "B56": "โรบินสัน ไลฟ์สไตล์ เพชรบุรี",
  "B61": "สหไทย พลาซ่า ทุ่งสง",
  "B80": "Market Village สุวรรณภูมิ",
  "B85": "โรบินสัน ไลฟ์สไตล์ ถลาง",
  "B86": "โรบินสัน ไลฟ์สไตล์ ฉลอง"
};

export default function BranchesPage() {
  const [region, setRegion] = useState<string>("all");
  const [q, setQ] = useState("");

  const regions = ["all", "R1", "R2", "R3", "R4"];

  const filtered = BRANCHES.filter(b =>
    (region === "all" || b.region === region) &&
    (q === "" || b.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <main className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">🏬 หาสาขา PAY BY PA.PHONE</h1>
        <a href="/" className="text-sm text-emerald-600 hover:underline">← หน้าหลัก</a>
      </header>

      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="🔍 ค้นหา เช่น ขอนแก่น, ภูเก็ต, เซ็นทรัล..."
        className="w-full border rounded-lg px-3 py-2 mb-3"/>

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {regions.map(r => (
          <button key={r} onClick={() => setRegion(r)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold ${
              region === r ? "bg-emerald-500 text-white" : "bg-white border"
            }`}
          >{r === "all" ? `ทั้งหมด (${BRANCHES.length})` : `${r} (${BRANCHES.filter(b => b.region === r).length})`}</button>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-2">พบ {filtered.length} สาขา</div>

      <div className="grid gap-2">
        {filtered.map(b => {
          const code = b.name.split(":")[0];
          const shopName = b.name.split(":")[1] || b.name;
          const mapQuery = MAP_QUERY[code] || shopName.replace(/^PA\s+/, "").trim();
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
          return (
            <div key={b.name} className="bg-white p-3 rounded-xl shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded mr-2">{b.region}</span>
                    <span className="font-mono">{code}</span>
                  </div>
                  <div className="font-medium">{shopName}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <a href={mapsUrl} target="_blank" rel="noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-semibold text-center whitespace-nowrap">
                    📍 แผนที่
                  </a>
                  {b.line_oa_id && (
                    <a href={`https://line.me/R/ti/p/${b.line_oa_id}`} target="_blank" rel="noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded font-semibold text-center whitespace-nowrap">
                      ➕ Line
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center text-gray-500 py-8">ไม่พบสาขา</div>}
      </div>
    </main>
  );
}
