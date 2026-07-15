import { kv } from "@vercel/kv";
import { ClientData } from "./types";

const INDEX_KEY = "azen:clients-index";
const clientKey = (name: string) => `azen:client:${name.trim().toLowerCase()}`;

export async function getIndex(): Promise<string[]> {
  const idx = await kv.get<string[]>(INDEX_KEY);
  return idx ?? [];
}

export async function addToIndex(name: string): Promise<string[]> {
  const idx = await getIndex();
  if (!idx.some((n) => n.toLowerCase() === name.toLowerCase())) {
    const updated = [...idx, name];
    await kv.set(INDEX_KEY, updated);
    return updated;
  }
  return idx;
}

export async function getClientData(name: string): Promise<ClientData | null> {
  const data = await kv.get<ClientData>(clientKey(name));
  return data ?? null;
}

export async function saveClientData(name: string, data: ClientData): Promise<void> {
  await kv.set(clientKey(name), data);
}

export function newClientRecord(name: string): ClientData {
  return { name, joined: new Date().toISOString(), checkins: [], notes: [] };
}
