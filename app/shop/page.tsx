"use client";
import { useEffect, useState } from "react";
import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import OrderModal from "@/components/OrderModal";
import LangSwitch from "@/components/LangSwitch";
import { useLang } from "@/lib/i18n";
import { Product } from "@/lib/types";

export default function Shop() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products || []));
  }, []);

  const filtered = products.filter(p =>
    (cat === "all" || p.category === cat) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-4">
      <header className="flex items-center gap-3 mb-4 flex-wrap">
        <a href="/" className="text-sm text-emerald-600">← หน้าหลัก</a>
        <div className="bg-emerald-400 px-3 py-2 rounded-lg font-bold text-sm">ดูสินค้า</div>
        <div className="flex-1 relative min-w-[200px]">
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder={t("search")}
            className="w-full border rounded-full px-4 py-2 pl-10 text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
        </div>
        <LangSwitch/>
      </header>

      <Banner />

      <section className="mt-6">
        <h2 className="font-semibold mb-3">{t("categories")}</h2>
        <CategoryFilter selected={cat} onSelect={setCat} />
      </section>

      <section className="mt-6">
        <h2 className="font-semibold mb-3">{t("recommended")}</h2>
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12">{t("noProducts")}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filtered.map(p => (
              <ProductCard key={p.id} p={p} onBuy={setSelected} />
            ))}
          </div>
        )}
      </section>

      <OrderModal product={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
