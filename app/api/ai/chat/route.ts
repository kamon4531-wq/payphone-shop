import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const SYSTEM_PROMPT = `คุณคือผู้ช่วยขายของ PAY BY PA.PHONE ร้านขายอุปกรณ์มือถือออนไลน์
- ตอบเป็นภาษาไทย สั้น กระชับ เป็นกันเอง
- แนะนำสินค้าที่เหมาะกับลูกค้าจากข้อมูลด้านล่าง
- ใส่ราคา (฿) ทุกครั้งที่แนะนำ
- ถ้าลูกค้าถามนอกเหนือสินค้า ให้แนะนำให้ติดต่อสาขา
- ไม่ต้องเดาราคาสินค้าที่ไม่มีในข้อมูล
- เมื่อแนะนำสินค้า ใส่ชื่อสินค้าให้ลูกค้ากด "สั่งซื้อ" ได้
- รูปแบบตอบ: ข้อความสั้น 2-3 บรรทัด + รายการสินค้า`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = (body.message || "").trim();
    const history: { role: string; text: string }[] = body.history || [];

    if (!userMessage) {
      return NextResponse.json({ error: "missing message" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    // Load products
    const { data: products } = await supabaseAdmin()
      .from("products")
      .select("id, name, category, price, old_price, description")
      .order("created_at", { ascending: false })
      .limit(80);

    const productList = (products || []).map(p =>
      `• ${p.name} | ${p.category} | ฿${p.price}${p.old_price ? ` (ลดจาก ฿${p.old_price})` : ""}${p.description ? ` — ${p.description.slice(0, 100)}` : ""}`
    ).join("\n");

    const fullSystem = `${SYSTEM_PROMPT}

=== สินค้าในร้าน (${products?.length || 0} รายการ) ===
${productList}`;

    // Build Gemini contents
    const contents = [
      ...history.slice(-10).map(h => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      })),
      {
        role: "user",
        parts: [{ text: userMessage }]
      }
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: fullSystem }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: `AI error: ${errText.slice(0, 200)}` }, { status: 500 });
    }

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "ขออภัย ระบบไม่สามารถตอบได้ในขณะนี้";

    // Try to detect product mentions in reply
    const mentionedProducts = (products || []).filter(p =>
      reply.includes(p.name)
    ).slice(0, 5);

    return NextResponse.json({
      ok: true,
      reply,
      products: mentionedProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        old_price: p.old_price
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "unknown" }, { status: 500 });
  }
}
