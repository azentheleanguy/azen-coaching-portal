import { NextRequest, NextResponse } from "next/server";
import { getIndex, addToIndex, getClientData, saveClientData, newClientRecord } from "@/lib/kv";

export async function GET() {
  try {
    const index = await getIndex();
    return NextResponse.json({ index });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load index" }, { status: 500 });
  }
}

// Registers a client name if it doesn't exist yet, returns their data
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const clean = name.trim();
    let data = await getClientData(clean);
    if (!data) {
      data = newClientRecord(clean);
      await saveClientData(clean, data);
    }
    await addToIndex(clean);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Failed to register client" }, { status: 500 });
  }
}
