"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, User, Plus, TrendingUp, Users, Sparkles, MessageSquare,
  Droplets, Footprints, Moon, Pill, Flame, Award,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Field, NumberInput, TextInput, TextArea, Rating, Seal, Delta, fmtDate } from "@/components/ui";
import { ClientData, CheckIn } from "@/lib/types";

async function fetchIndex(): Promise<string[]> {
  const r = await fetch("/api/index");
  const j = await r.json();
  return j.index ?? [];
}
async function fetchClient(name: string): Promise<ClientData | null> {
  const r = await fetch(`/api/client/${encodeURIComponent(name)}`);
  const j = await r.json();
  return j.data;
}

export default function ClientPage() {
  const [name, setName] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.session?.role === "client") setName(j.session.name);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <div className="min-h-screen bg-bg" />;
  }

  return name ? (
    <ClientShell
      name={name}
      onExit={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setName(null);
      }}
    />
  ) : (
    <ClientLogin onEnter={setName} />
  );
}

function ClientLogin({ onEnter }: { onEnter: (n: string) => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (busy) return;
    setErr("");
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      setErr("Please fill in all fields");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "signup" ? { name, email, password } : { email, password }
      ),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(j.error || "Something went wrong");
      return;
    }
    onEnter(j.name);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg relative">
      <button onClick={() => router.push("/")} className="absolute top-5 left-5 flex items-center gap-1 font-body" style={{ color: "#7B7B80", fontSize: 13 }}>
        <ChevronLeft size={16} /> Back
      </button>
      <User size={28} color="#C9A961" className="mb-4" />
      <div className="font-display font-bold text-off mb-1" style={{ fontSize: 22 }}>
        {mode === "signup" ? "CREATE ACCOUNT" : "WELCOME BACK"}
      </div>
      <div className="font-body mb-6 text-center" style={{ color: "#7B7B80", fontSize: 13 }}>
        {mode === "signup" ? "Set up your account to start tracking" : "Log in to check in or view your progress"}
      </div>
      <div className="w-full max-w-xs">
        {mode === "signup" && (
          <div className="mb-3">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>
        )}
        <div className="mb-3">
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        </div>
        <TextInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {err && <div className="font-body mt-2" style={{ color: "#B4553F", fontSize: 12 }}>{err}</div>}
        <button
          onClick={submit}
          disabled={busy}
          className="font-display w-full mt-3 py-3 rounded bg-gold"
          style={{ color: "#12100A", fontSize: 14, letterSpacing: "0.05em", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "..." : mode === "signup" ? "CREATE ACCOUNT" : "LOG IN"}
        </button>
        <button
          onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(""); }}
          className="font-body w-full mt-3 text-center"
          style={{ color: "#7B7B80", fontSize: 12 }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}

function ClientShell({ name, onExit }: { name: string; onExit: () => void }) {
  const [tab, setTab] = useState<"checkin" | "progress" | "community">("checkin");
  const [data, setData] = useState<ClientData | null>(null);
  const [index, setIndex] = useState<string[]>([]);

  useEffect(() => {
    fetchClient(name).then(setData);
    fetchIndex().then(setIndex);
  }, [name]);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center font-body bg-bg" style={{ color: "#7B7B80" }}>Loading...</div>;
  }

  return (
    <div className="min-h-screen font-body bg-bg">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={onExit} className="flex items-center gap-1" style={{ color: "#7B7B80", fontSize: 13 }}>
          <ChevronLeft size={16} /> Log out
        </button>
        <div className="font-display" style={{ color: "#E4C878", fontSize: 13, letterSpacing: "0.1em" }}>
          {name.toUpperCase()}
        </div>
      </div>

      {tab === "checkin" && <CheckinForm data={data} onSaved={setData} />}
      {tab === "progress" && <ProgressView data={data} />}
      {tab === "community" && <CommunityView index={index} currentName={name} />}

      <div className="fixed bottom-0 left-0 right-0 flex bg-panel border-t border-border">
        {[
          { k: "checkin" as const, label: "Check-in", icon: Plus },
          { k: "progress" as const, label: "Progress", icon: TrendingUp },
          { k: "community" as const, label: "Community", icon: Users },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className="flex-1 flex flex-col items-center gap-1 py-3"
            style={{ color: tab === t.k ? "#C9A961" : "#7B7B80" }}
          >
            <t.icon size={18} />
            <span style={{ fontSize: 10, letterSpacing: "0.04em" }}>{t.label}</span>
          </button>
        ))}
      </div>
      <div style={{ height: 64 }} />
    </div>
  );
}

function CheckinForm({ data, onSaved }: { data: ClientData; onSaved: (d: ClientData) => void }) {
  const last = data.checkins[data.checkins.length - 1];
  const [f, setF] = useState({
    weight: "", waist: "", chest: "", rightArm: "", leftArm: "", rightThigh: "", leftThigh: "", hips: "",
    daysCompleted: "", planDays: "6", sleepHours: "", dietAdherence: "yes", waterLiters: "", steps: "",
    supplements: "no", supplementsDetail: "",
    energy: 5, motivation: 5, stress: 5, cravings: 5,
    wins: "", challenges: "", questions: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async () => {
    setSaving(true);
    const entry: CheckIn = { ...f, date: new Date().toISOString() };
    const patch = { checkins: [...data.checkins, entry] };
    const res = await fetch(`/api/client/${encodeURIComponent(data.name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await res.json();
    setSaving(false);
    setSaved(true);
    onSaved(j.data);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <Award size={36} color="#C9A961" className="mb-3" />
        <div className="font-display font-bold text-off" style={{ fontSize: 20 }}>CHECK-IN LOGGED</div>
        <div className="font-body mt-1" style={{ color: "#7B7B80", fontSize: 13 }}>
          Your coach will review and drop a note soon.
        </div>
        <button
          onClick={() => setSaved(false)}
          className="font-display mt-6 px-5 py-2 rounded border border-border"
          style={{ color: "#9CA1AA", fontSize: 13 }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pb-10 pt-4">
      <div className="font-display font-bold text-off mb-4" style={{ fontSize: 18 }}>WEEKLY CHECK-IN</div>

      <div className="font-body mb-2" style={{ color: "#C9A961", fontSize: 11, letterSpacing: "0.1em" }}>BODY METRICS (in / cm)</div>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label="Weight (kg)"><NumberInput value={f.weight} onChange={set("weight")} placeholder={last?.weight ?? "—"} /></Field>
        <Field label="Waist"><NumberInput value={f.waist} onChange={set("waist")} placeholder={last?.waist ?? "—"} /></Field>
        <Field label="Chest"><NumberInput value={f.chest} onChange={set("chest")} placeholder={last?.chest ?? "—"} /></Field>
        <Field label="Hips"><NumberInput value={f.hips} onChange={set("hips")} placeholder={last?.hips ?? "—"} /></Field>
        <Field label="Right arm"><NumberInput value={f.rightArm} onChange={set("rightArm")} placeholder={last?.rightArm ?? "—"} /></Field>
        <Field label="Left arm"><NumberInput value={f.leftArm} onChange={set("leftArm")} placeholder={last?.leftArm ?? "—"} /></Field>
        <Field label="Right thigh"><NumberInput value={f.rightThigh} onChange={set("rightThigh")} placeholder={last?.rightThigh ?? "—"} /></Field>
        <Field label="Left thigh"><NumberInput value={f.leftThigh} onChange={set("leftThigh")} placeholder={last?.leftThigh ?? "—"} /></Field>
      </div>

      <div className="font-body mt-2 mb-2" style={{ color: "#C9A961", fontSize: 11, letterSpacing: "0.1em" }}>ADHERENCE</div>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label="Workout days completed" icon={Flame}><NumberInput value={f.daysCompleted} onChange={set("daysCompleted")} placeholder="of plan" /></Field>
        <Field label="Plan target (days/wk)"><NumberInput value={f.planDays} onChange={set("planDays")} /></Field>
        <Field label="Avg sleep (hrs)" icon={Moon}><NumberInput value={f.sleepHours} onChange={set("sleepHours")} /></Field>
        <Field label="Avg water (L)" icon={Droplets}><NumberInput value={f.waterLiters} onChange={set("waterLiters")} /></Field>
        <Field label="Avg steps" icon={Footprints}><NumberInput value={f.steps} onChange={set("steps")} /></Field>
        <Field label="Diet adherence">
          <select className="bg-panelAlt border border-border text-off rounded-md px-3 py-2.5 w-full text-sm font-body" value={f.dietAdherence} onChange={set("dietAdherence") as any}>
            <option value="yes">On track</option>
            <option value="partial">Partial</option>
            <option value="no">Off track</option>
          </select>
        </Field>
      </div>
      <Field label="Supplements taken this week?" icon={Pill}>
        <select className="bg-panelAlt border border-border text-off rounded-md px-3 py-2.5 w-full text-sm font-
