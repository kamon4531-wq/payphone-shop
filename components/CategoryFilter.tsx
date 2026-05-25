"use client";
import { CATEGORIES } from "@/lib/types";

export default function CategoryFilter({
  selected, onSelect
}: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {CATEGORIES.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm border transition ${
            selected === c.id
              ? "bg-emerald-400 border-emerald-400 text-black font-semibold"
              : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
