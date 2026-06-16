"use client";
import { useLang } from "@/lib/i18n";

export default function LangSwitch() {
  const { lang, change } = useLang();
  return (
    <div className="flex border rounded-full overflow-hidden text-xs">
      <button onClick={() => change("th")}
        className={`px-3 py-1 ${lang === "th" ? "bg-emerald-500 text-white" : "bg-white text-gray-600"}`}>
        TH
      </button>
      <button onClick={() => change("en")}
        className={`px-3 py-1 ${lang === "en" ? "bg-emerald-500 text-white" : "bg-white text-gray-600"}`}>
        EN
      </button>
    </div>
  );
}
