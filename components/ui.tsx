"use client";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

export function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function Seal({ streak }: { streak: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full font-display shrink-0"
      style={{
        width: 56,
        height: 56,
        border: "2px solid #C9A961",
        color: "#E4C878",
        background: "radial-gradient(circle, rgba(201,169,97,0.12), transparent)",
      }}
    >
      <div className="text-center leading-none">
        <div style={{ fontSize: 18, fontWeight: 700 }}>{streak}</div>
        <div style={{ fontSize: 8, letterSpacing: "0.1em", color: "#9CA1AA" }}>WEEKS</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-4">
      <div
        className="flex items-center gap-2 mb-1.5 font-body uppercase"
        style={{ color: "#9CA1AA", fontSize: 12, letterSpacing: "0.04em" }}
      >
        {Icon && <Icon size={13} />} {label}
      </div>
      {children}
    </label>
  );
}

export const inputClass =
  "bg-panelAlt border border-border text-off rounded-md px-3 py-2.5 w-full text-sm font-body";

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" step="any" className={inputClass} {...props} />;
}
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={inputClass} {...props} />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-[70px] resize-y`} {...props} />;
}

export function Rating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="font-body uppercase" style={{ color: "#9CA1AA", fontSize: 12, letterSpacing: "0.04em" }}>
          {label}
        </span>
        <span className="font-display" style={{ color: "#C9A961", fontSize: 14 }}>
          {value}/10
        </span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}

export function Delta({ curr, prev, invert }: { curr?: number; prev?: number; invert?: boolean }) {
  if (prev == null || curr == null || isNaN(prev) || isNaN(curr)) return <Minus size={14} color="#7B7B80" />;
  const diff = curr - prev;
  if (Math.abs(diff) < 0.05) return <Minus size={14} color="#7B7B80" />;
  const good = invert ? diff < 0 : diff > 0;
  const color = good ? "#8FAE7B" : "#B4553F";
  return (
    <span className="inline-flex items-center gap-0.5 font-body" style={{ color, fontSize: 12 }}>
      {diff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(diff).toFixed(1)}
    </span>
  );
}
