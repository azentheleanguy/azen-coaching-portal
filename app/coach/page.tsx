"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TextInput, TextArea, Seal, Delta, fmtDate } from "@/components/ui";
import { ClientData } from "@/lib/types";

const COACH_CODE = "AZEN2026";

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

export default function CoachPage() {
  const [authed, setAuthed] = useState(false);
  return authed ? <CoachDashboard /> : <CoachLogin onSuccess={() => setAuthed(true)} />;
}

function CoachLogin({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  const tryEnter = () => {
    if (code === COACH_CODE) onSuccess();
    else setErr("Incorrect code");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg relative">
      <button onClick={() => router.push("/")} className="absolute top-5 left-5 flex items-center gap-1 font-body" style={{ color: "#7B7B80", fontSize: 13 }}>
        <ChevronLeft size={16} /> Back
      </button>
      <Lock size={28} color="#C9A961" className="mb-4" />
      <div className="font-display font-bold text-off mb-1" style={{ fontSize: 22 }}>COACH ACCESS</div>
      <div className="font-body mb-6" style={{ color: "#7B7B80", fontSize: 13 }}>Enter your access code</div>
      <div className="w-full max-w-xs">
        <TextInput
          value={code}
          onChange={(e) => { setCode(e.target.value); setErr(""); }}
          placeholder="Access code"
          onKeyDown={(e) => e.key === "Enter" && tryEnter()}
        />
        {err && <div className="font-body mt-2" style={{ color: "#B4553F", fontSize: 12 }}>{err}</div>}
        <button onClick={tryEnter} className="font-display w-full mt-3 py-3 rounded bg-gold" style={{ color: "#12100A", fontSize: 14, letterSpacing: "0.05em" }}>
          ENTER
        </button>
        <div className="font-body mt-4 text-center" style={{ color: "#7B7B80", fontSize: 11 }}>
          Set your own code in the code before deploying — see the README.
        </div>
      </div>
    </div>
  );
}

function CoachDashboard() {
  const [rows, setRows] = useState<{ name: string; count: number; last?: any; prev?: any }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    const idx = await fetchIndex();
    const all = await Promise.all(
      idx.map(async (n) => {
        const d = await fetchClient(n);
        const last = d?.checkins[d.checkins.length - 1];
        const prev = d?.checkins[d.checkins.length - 2];
        return { name: n, count: d?.checkins.length || 0, last, prev };
      })
    );
    setRows(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (selected) {
    return <CoachClientDetail name={selected} onBack={() => { setSelected(null); load(); }} />;
  }

  return (
    <div className="px-5 pb-10 pt-4 bg-bg min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="font-display font-bold text-off" style={{ fontSize: 20 }}>COACH DASHBOARD</div>
          <div className="font-body" style={{ color: "#7B7B80", fontSize: 12 }}>{rows.length} client{rows.length !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={() => router.push("/")} className="font-body" style={{ color: "#7B7B80", fontSize: 13 }}>Exit</button>
      </div>
      {loading ? (
        <div className="font-body" style={{ color: "#7B7B80" }}>Loading...</div>
      ) : rows.length === 0 ? (
        <div className="font-body py-16 text-center" style={{ color: "#7B7B80", fontSize: 13 }}>
          No clients yet. Once a client signs in and checks in, they&apos;ll appear here.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <button
              key={r.name}
              onClick={() => setSelected(r.name)}
              className="rounded p-3 flex items-center justify-between text-left bg-panelAlt border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Seal streak={r.count} />
                <div className="min-w-0">
                  <div className="font-body truncate text-off" style={{ fontSize: 14 }}>{r.name}</div>
                  <div className="font-body" style={{ color: "#7B7B80", fontSize: 11 }}>
                    {r.last ? `Last: ${fmtDate(r.last.date)} \u00b7 ${r.last.weight || "—"} kg` : "No check-ins yet"}
                  </div>
                </div>
              </div>
              {r.last && <Delta curr={Number(r.last.weight)} prev={Number(r.prev?.weight)} invert />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CoachClientDetail({ name, onBack }: { name: string; onBack: () => void }) {
  const [data, setData] = useState<ClientData | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => { fetchClient(name).then(setData); }, [name]);

  const addNote = async () => {
    if (!note.trim() || !data) return;
    const updatedNotes = [...data.notes, { text: note.trim(), date: new Date().toISOString() }];
    const res = await fetch(`/api/client/${encodeURIComponent(name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: updatedNotes }),
    });
    const j = await res.json();
    setData(j.data);
    setNote("");
  };

  if (!data) return <div className="font-body p-6 bg-bg min-h-screen" style={{ color: "#7B7B80" }}>Loading...</div>;

  const rows = data.checkins.map((c, i) => ({ idx: i + 1, date: fmtDate(c.date), weight: c.weight ? Number(c.weight) : null }));

  return (
    <div className="px-5 pb-10 pt-4 bg-bg min-h-screen">
      <button onClick={onBack} className="flex items-center gap-1 mb-4 font-body" style={{ color: "#7B7B80", fontSize: 13 }}>
        <ChevronLeft size={16} /> All clients
      </button>
      <div className="font-display font-bold text-off mb-4" style={{ fontSize: 20 }}>{name.toUpperCase()}</div>

      {rows.length > 0 && (
        <div className="bg-panelAlt border border-border rounded-lg p-3 mb-5">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={rows}>
              <CartesianGrid stroke="#2A2A2D" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#7B7B80", fontSize: 10 }} />
              <YAxis tick={{ fill: "#7B7B80", fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#141416", border: "1px solid #2A2A2D", borderRadius: 6, fontSize: 12 }} labelStyle={{ color: "#F3EFE6" }} />
              <Line type="monotone" dataKey="weight" stroke="#C9A961" strokeWidth={2} dot={{ r: 3, fill: "#C9A961" }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="font-body mb-2" style={{ color: "#C9A961", fontSize: 11, letterSpacing: "0.1em" }}>CHECK-INS</div>
      <div className="flex flex-col gap-3 mb-6">
        {[...data.checkins].reverse().map((c, i) => (
          <div key={i} className="rounded p-3 bg-panelAlt border border-border">
            <div className="flex justify-between mb-2">
              <span className="font-body text-off" style={{ fontSize: 13 }}>{fmtDate(c.date)}</span>
              <span className="font-display" style={{ color: "#C9A961", fontSize: 13 }}>{c.weight ? `${c.weight} kg` : "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-body" style={{ color: "#9CA1AA", fontSize: 11 }}>
              <div>Workouts: {c.daysCompleted}/{c.planDays}</div>
              <div>Sleep: {c.sleepHours}h</div>
              <div>Water: {c.waterLiters}L</div>
              <div>Steps: {c.steps}</div>
              <div>Diet: {c.dietAdherence}</div>
              <div>Energy {c.energy} &middot; Motiv {c.motivation} &middot; Stress {c.stress}</div>
            </div>
            {c.wins && <div className="font-body mt-2 text-off" style={{ fontSize: 12 }}>Win: {c.wins}</div>}
            {c.challenges && <div className="font-body mt-1" style={{ color: "#7B7B80", fontSize: 12 }}>Challenge: {c.challenges}</div>}
            {c.questions && <div className="font-body mt-1" style={{ color: "#E4C878", fontSize: 12 }}>Q: {c.questions}</div>}
          </div>
        ))}
        {data.checkins.length === 0 && <div className="font-body" style={{ color: "#7B7B80", fontSize: 13 }}>No check-ins submitted yet.</div>}
      </div>

      <div className="font-body mb-2" style={{ color: "#C9A961", fontSize: 11, letterSpacing: "0.1em" }}>COACH NOTES</div>
      <div className="flex flex-col gap-2 mb-3">
        {[...data.notes].reverse().map((n, i) => (
          <div key={i} className="rounded p-2 border border-border" style={{ background: "rgba(201,169,97,0.06)" }}>
            <div className="font-body" style={{ color: "#7B7B80", fontSize: 10 }}>{fmtDate(n.date)}</div>
            <div className="font-body text-off" style={{ fontSize: 13 }}>{n.text}</div>
          </div>
        ))}
      </div>
      <TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for this client..." />
      <button onClick={addNote} className="font-display mt-2 px-4 py-2 rounded bg-gold" style={{ color: "#12100A", fontSize: 13 }}>
        ADD NOTE
      </button>
    </div>
  );
}
