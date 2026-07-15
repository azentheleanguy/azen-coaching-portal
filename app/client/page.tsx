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
async function registerClient(name: string): Promise<ClientData> {
  const r = await fetch("/api/index", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const j = await r.json();
  return j.data;
}
async function fetchClient(name: string): Promise<ClientData | null> {
  const r = await fetch(`/api/client/${encodeURIComponent(name)}`);
  const j = await r.json();
  return j.data;
}
async function updateClient(name: string, patch: Partial<ClientData>): Promise<ClientData> {
  const r = await fetch(`/api/client/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const j = await r.json();
  return j.data;
}

export default function ClientPage() {
  const [name, setName] = useState<string | null>(null);
  return name ? <ClientShell name={name} onExit={() => setName(null)} /> : <ClientLogin onEnter={setName} />;
}

function ClientLogin({ onEnter }: { onEnter: (n: string) => void }) {
  const [input, setInput] = useState("");
  const [index, setIndex] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchIndex().then(setIndex).catch(() => {});
  }, []);

  const go = async () => {
    if (!input.trim() || busy) return;
    setBusy(true);
    await registerClient(input.trim());
    setBusy(false);
    onEnter(input.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg relative">
      <button onClick={() => router.push("/")} className="absolute top-5 left-5 flex items-center gap-1 font-body" style={{ color: "#7B7B80", fontSize: 13 }}>
        <ChevronLeft size={16} /> Back
      </button>
      <User size={28} color="#C9A961" className="mb-4" />
      <div className="font-display font-bold text-off mb-1" style={{ fontSize: 22 }}>WELCOME</div>
      <div className="font-body mb-6 text-center" style={{ color: "#7B7B80", fontSize: 13 }}>
        Enter your name to check in or view your progress
      </div>
      <div className="w-full max-w-xs">
        <TextInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your full name"
          list="client-names"
          onKeyDown={(e) => e.key === "Enter" && go()}
        />
        <datalist id="client-names">
          {index.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <button
          onClick={go}
          disabled={busy}
          className="font-display w-full mt-3 py-3 rounded bg-gold"
          style={{ color: "#12100A", fontSize: 14, letterSpacing: "0.05em", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "..." : "CONTINUE"}
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
          <ChevronLeft size={16} /> Exit
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
        <select className="bg-panelAlt border border-border text-off rounded-md px-3 py-2.5 w-full text-sm font-body" value={f.supplements} onChange={set("supplements") as any}>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </Field>
      {f.supplements === "yes" && (
        <Field label="Which supplements">
          <TextInput value={f.supplementsDetail} onChange={set("supplementsDetail")} placeholder="e.g. whey, creatine, multivitamin" />
        </Field>
      )}

      <div className="font-body mt-2 mb-2" style={{ color: "#C9A961", fontSize: 11, letterSpacing: "0.1em" }}>HOW THIS WEEK FELT</div>
      <Rating label="Energy" value={f.energy} onChange={(v) => setF((s) => ({ ...s, energy: v }))} />
      <Rating label="Motivation" value={f.motivation} onChange={(v) => setF((s) => ({ ...s, motivation: v }))} />
      <Rating label="Stress" value={f.stress} onChange={(v) => setF((s) => ({ ...s, stress: v }))} />
      <Rating label="Hunger cravings" value={f.cravings} onChange={(v) => setF((s) => ({ ...s, cravings: v }))} />

      <Field label="Wins this week" icon={Sparkles}><TextArea value={f.wins} onChange={set("wins")} placeholder="What went well?" /></Field>
      <Field label="Challenges faced"><TextArea value={f.challenges} onChange={set("challenges")} placeholder="What was hard?" /></Field>
      <Field label="Questions for your coach" icon={MessageSquare}><TextArea value={f.questions} onChange={set("questions")} /></Field>

      <button
        onClick={submit}
        disabled={saving}
        className="font-display w-full mt-2 py-3.5 rounded bg-gold"
        style={{ color: "#12100A", fontSize: 15, letterSpacing: "0.05em", opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "SAVING..." : "SUBMIT CHECK-IN"}
      </button>
    </div>
  );
}

function ProgressView({ data }: { data: ClientData }) {
  const rows = data.checkins.map((c, i) => ({
    idx: i + 1,
    date: fmtDate(c.date),
    weight: c.weight ? Number(c.weight) : null,
  }));
  if (rows.length === 0) {
    return <div className="font-body px-5 py-16 text-center" style={{ color: "#7B7B80", fontSize: 13 }}>No check-ins yet — submit your first one to start tracking.</div>;
  }
  const last = data.checkins[data.checkins.length - 1];
  const prev = data.checkins[data.checkins.length - 2];

  return (
    <div className="px-5 pb-10 pt-4">
      <div className="flex items-center justify-between mb-5">
        <div className="font-display font-bold text-off" style={{ fontSize: 18 }}>MY PROGRESS</div>
        <Seal streak={data.checkins.length} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Weight (kg)", curr: last.weight, prev: prev?.weight },
          { label: "Waist", curr: last.waist, prev: prev?.waist },
        ].map((m) => (
          <div key={m.label} className="rounded p-3 bg-panelAlt border border-border">
            <div className="font-body uppercase" style={{ color: "#7B7B80", fontSize: 11 }}>{m.label}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-off" style={{ fontSize: 20 }}>{m.curr || "—"}</span>
              <Delta curr={Number(m.curr)} prev={Number(m.prev)} invert />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-panelAlt border border-border rounded-lg p-3">
        <div className="font-body mb-2" style={{ color: "#9CA1AA", fontSize: 11, letterSpacing: "0.08em" }}>WEIGHT TREND</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rows}>
            <CartesianGrid stroke="#2A2A2D" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#7B7B80", fontSize: 10 }} />
            <YAxis tick={{ fill: "#7B7B80", fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#141416", border: "1px solid #2A2A2D", borderRadius: 6, fontSize: 12 }} labelStyle={{ color: "#F3EFE6" }} />
            <Line type="monotone" dataKey="weight" stroke="#C9A961" strokeWidth={2} dot={{ r: 3, fill: "#C9A961" }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="font-body mt-6 mb-2" style={{ color: "#C9A961", fontSize: 11, letterSpacing: "0.1em" }}>CHECK-IN HISTORY</div>
      <div className="flex flex-col gap-2">
        {[...data.checkins].reverse().map((c, i) => (
          <div key={i} className="rounded p-3 flex justify-between items-center bg-panelAlt border border-border">
            <div>
              <div className="font-body text-off" style={{ fontSize: 13 }}>{fmtDate(c.date)}</div>
              <div className="font-body" style={{ color: "#7B7B80", fontSize: 11 }}>
                {c.daysCompleted || "?"}/{c.planDays || "?"} workouts &middot; {c.dietAdherence}
              </div>
            </div>
            <div className="font-display" style={{ color: "#C9A961", fontSize: 14 }}>{c.weight ? `${c.weight} kg` : "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityView({ index, currentName }: { index: string[]; currentName: string }) {
  const [rows, setRows] = useState<{ name: string; count: number; wins?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await Promise.all(
        index.map(async (n) => {
          const d = await fetchClient(n);
          return d ? { name: n, count: d.checkins.length, wins: d.checkins[d.checkins.length - 1]?.wins } : null;
        })
      );
      setRows(all.filter((r): r is { name: string; count: number; wins?: string } => !!r).sort((a, b) => b.count - a.count));
      setLoading(false);
    })();
  }, [index]);

  return (
    <div className="px-5 pb-10 pt-4">
      <div className="font-display font-bold text-off mb-1" style={{ fontSize: 18 }}>COMMUNITY</div>
      <div className="font-body mb-5" style={{ color: "#7B7B80", fontSize: 12 }}>Everyone showing up, one week at a time.</div>
      {loading ? (
        <div className="font-body" style={{ color: "#7B7B80", fontSize: 13 }}>Loading...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => {
            const isYou = r.name.toLowerCase() === currentName.toLowerCase();
            return (
              <div
                key={r.name}
                className="rounded p-3 flex items-center gap-3 border"
                style={{ background: isYou ? "rgba(201,169,97,0.08)" : "#1B1B1E", borderColor: isYou ? "#C9A961" : "#2A2A2D" }}
              >
                <Seal streak={r.count} />
                <div className="flex-1 min-w-0">
                  <div className="font-body text-off" style={{ fontSize: 14 }}>{r.name}{isYou ? " (you)" : ""}</div>
                  {r.wins && <div className="font-body truncate" style={{ color: "#7B7B80", fontSize: 11 }}>&ldquo;{r.wins}&rdquo;</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
