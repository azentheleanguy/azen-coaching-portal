"use client";
import Link from "next/link";
import { User, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="text-center mb-10">
        <div className="font-display" style={{ color: "#E4C878", fontSize: 13, letterSpacing: "0.3em" }}>
          COACHED BY
        </div>
        <div className="font-display font-bold text-off" style={{ fontSize: 42, lineHeight: 1 }}>
          AZEN
        </div>
        <div className="font-body mt-2" style={{ color: "#7B7B80", fontSize: 12, letterSpacing: "0.15em" }}>
          DISCIPLINE &middot; TRANSFORM &middot; PERFORM
        </div>
      </div>
      <div className="w-full max-w-xs flex flex-col gap-3">
        <Link
          href="/client"
          className="font-display flex items-center justify-center gap-2 py-3.5 rounded transition-transform hover:scale-[1.02] bg-gold"
          style={{ color: "#12100A", fontSize: 15, letterSpacing: "0.05em" }}
        >
          <User size={17} /> I&apos;M A CLIENT
        </Link>
        <Link
          href="/coach"
          className="font-display flex items-center justify-center gap-2 py-3.5 rounded border transition-transform hover:scale-[1.02] bg-panel border-border text-off"
          style={{ fontSize: 15, letterSpacing: "0.05em" }}
        >
          <Lock size={16} /> COACH LOGIN
        </Link>
      </div>
      <div className="font-body mt-10 text-center" style={{ color: "#4A4A4E", fontSize: 11 }}>
        coachedbyazen@gmail.com &middot; +91 96327 61744
      </div>
    </div>
  );
}
