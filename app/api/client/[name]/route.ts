import { NextRequest, NextResponse } from "next/server";
import { getClientData, saveClientData, newClientRecord, addToIndex } from "@/lib/kv";
import { verifyToken } from "@/lib/auth";

function authorize(req: NextRequest, name: string) {
  const token = req.cookies.get("session")?.value;
  const session = verifyToken(token);
  if (!session) return null;
  if (session.role === "coach") return session;
  if (session.role === "client" && session.name?.toLowerCase() === name.toLowerCase()) return session;
  return null;
}

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const name = decodeURIComponent(params.name);
    if (!authorize(req, name)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    const data = await getClientData(name);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load client" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const name = decodeURIComponent(params.name);
    if (!authorize(req, name)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    const body = await req.json();
    let existing = await getClientData(name);
    if (!existing) {
      existing = newClientRecord(name);
      await addToIndex(name);
    }
    const updated = { ...existing, ...body, name };
    await saveClientData(name, updated);
    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}
