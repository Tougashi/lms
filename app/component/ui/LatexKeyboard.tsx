"use client";

import { useState } from "react";

interface LatexKeyboardProps {
  onInsert: (latex: string) => void;
}

type Category = "Pecahan/Akar" | "Pangkat/Indeks" | "Huruf Yunani" | "Operator" | "Lanjutan";

const CATEGORIES: Category[] = [
  "Pecahan/Akar",
  "Pangkat/Indeks",
  "Huruf Yunani",
  "Operator",
  "Lanjutan",
];

const SYMBOLS: Record<Category, { label: string; insert: string }[]> = {
  "Pecahan/Akar": [
    { label: "a/b", insert: "$\\frac{a}{b}$" },
    { label: "√x", insert: "$\\sqrt{x}$" },
    { label: "ⁿ√x", insert: "$\\sqrt[n]{x}$" },
    { label: "x²", insert: "$x^{2}$" },
    { label: "x^n", insert: "$x^{n}$" },
    { label: "|x|", insert: "$\\left|x\\right|$" },
  ],
  "Pangkat/Indeks": [
    { label: "xᵢ", insert: "$x_{i}$" },
    { label: "xᵢⁿ", insert: "$x_{i}^{n}$" },
    { label: "aⁿ", insert: "$a^{n}$" },
    { label: "logₐb", insert: "$\\log_{a}{b}$" },
    { label: "ln x", insert: "$\\ln x$" },
    { label: "eˣ", insert: "$e^{x}$" },
  ],
  "Huruf Yunani": [
    { label: "α", insert: "$\\alpha$" },
    { label: "β", insert: "$\\beta$" },
    { label: "γ", insert: "$\\gamma$" },
    { label: "δ", insert: "$\\delta$" },
    { label: "θ", insert: "$\\theta$" },
    { label: "π", insert: "$\\pi$" },
    { label: "σ", insert: "$\\sigma$" },
    { label: "μ", insert: "$\\mu$" },
    { label: "λ", insert: "$\\lambda$" },
    { label: "ω", insert: "$\\omega$" },
    { label: "Σ", insert: "$\\Sigma$" },
    { label: "Δ", insert: "$\\Delta$" },
  ],
  "Operator": [
    { label: "≤", insert: "$\\leq$" },
    { label: "≥", insert: "$\\geq$" },
    { label: "≠", insert: "$\\neq$" },
    { label: "≈", insert: "$\\approx$" },
    { label: "∞", insert: "$\\infty$" },
    { label: "×", insert: "$\\times$" },
    { label: "÷", insert: "$\\div$" },
    { label: "±", insert: "$\\pm$" },
    { label: "∈", insert: "$\\in$" },
    { label: "∉", insert: "$\\notin$" },
    { label: "⊂", insert: "$\\subset$" },
    { label: "∪", insert: "$\\cup$" },
  ],
  "Lanjutan": [
    { label: "Σᵢ", insert: "$\\sum_{i=1}^{n}$" },
    { label: "∫", insert: "$\\int_{a}^{b}$" },
    { label: "lim", insert: "$\\lim_{x \\to \\infty}$" },
    { label: "C(n,k)", insert: "$\\binom{n}{k}$" },
    { label: "→", insert: "$\\to$" },
    { label: "⟺", insert: "$\\Leftrightarrow$" },
    { label: "∀", insert: "$\\forall$" },
    { label: "∃", insert: "$\\exists$" },
    { label: "$$", insert: "$$formula$$" },
  ],
};

export default function LatexKeyboard({ onInsert }: LatexKeyboardProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("Pecahan/Akar");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Buka keyboard LaTeX"
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          open
            ? "border-[#7054dc] bg-[#7054dc] text-white"
            : "border-[#e0dfe6] bg-white text-[#7054dc] hover:border-[#7054dc]"
        }`}
      >
        <span className="text-[13px] font-bold">Σ</span> LaTeX
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-50 w-72 rounded-xl border border-[#e0dfe6] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#f0eef8] px-3 py-2">
            <span className="text-[11px] font-semibold text-[#7054dc]">Keyboard LaTeX</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#aaa] hover:text-[#555]"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-0 overflow-x-auto border-b border-[#f0eef8] px-2 pt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-t px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  activeCategory === cat
                    ? "border-b-2 border-[#7054dc] text-[#7054dc]"
                    : "text-[#8f95a3] hover:text-[#7054dc]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-3">
            {SYMBOLS[activeCategory].map((sym) => (
              <button
                key={sym.insert}
                type="button"
                onClick={() => onInsert(sym.insert)}
                title={sym.insert}
                className="rounded-lg border border-[#e0dfe6] bg-[#faf9ff] px-1 py-2 text-[12px] font-medium text-[#232530] transition-colors hover:border-[#7054dc] hover:bg-[#efe9ff] hover:text-[#7054dc]"
              >
                {sym.label}
              </button>
            ))}
          </div>

          <div className="border-t border-[#f0eef8] px-3 py-2">
            <p className="text-[10px] text-[#aaa]">
              Klik simbol untuk sisipkan ke editor. Gunakan <code className="text-[#7054dc]">$...$</code> untuk inline, <code className="text-[#7054dc]">$$...$$</code> untuk tampilan penuh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
