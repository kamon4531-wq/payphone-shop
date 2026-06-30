"use client";
import { useEffect, useState } from "react";
import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import OrderModal from "@/components/OrderModal";
import CartModal, { CartItem } from "@/components/CartModal";
import LangSwitch from "@/components/LangSwitch";
import { useLang } from "@/lib/i18n";
import { Product } from "@/lib/types";

export default function Shop() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products || []));
    const saved = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    if (saved) { try { setCart(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(p: Product) {
    setCart(prev => {
      const found = prev.find(it => it.p.id === p.id);
      if (found) return prev.map(it => it.p.id === p.id ? { ...it, qty: it.qty + 1 } : it);
      return [...prev, { p, qty: 1 }];
    });
  }
  function setQty(id: string, qty: number) {
    setCart(prev => qty <= 0 ? prev.filter(it => it.p.id !== id) : prev.map(it => it.p.id === id ? { ...it, qty } : it));
  }
  function removeItem(id: string) { setCart(prev => prev.filter(it => it.p.id !== id)); }
  function clearCart() { setCart([]); }

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

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
              <ProductCard key={p.id} p={p} onBuy={setSelected} onAdd={addToCart} />
            ))}
          </div>
        )}
      </section>

      <OrderModal product={selected} onClose={() => setSelected(null)} />
      {cartOpen && <CartModal items={cart} onClose={()=>setCartOpen(false)} setQty={setQty} removeItem={removeItem} clearCart={clearCart} />}

      <button onClick={()=>setCartOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-full w-16 h-16 shadow-lg flex items-center justify-center active:scale-95 transition"
        style={{ backgroundColor: "#ee4d2d" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v0M9 19a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center" style={{ backgroundColor: "#ffd200", color: "#7a1500" }}>{cartCount}</span>
        )}
      </button>
    </main>
  );
}
