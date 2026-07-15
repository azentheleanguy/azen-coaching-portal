import { NextRequest, NextResponse } from "next/server";
import { getClientData, saveClientData, newClientRecord, addToIndex } from "@/lib/kv";

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const name = decodeURIComponent(params.name);
    const data = await getClientData(name);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load client" }, { status: 500 });
  }
}

// Full overwrite of a client's data (used after adding a check-in or coach note)
export async function PUT(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const name = decodeURIComponent(params.name);
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
