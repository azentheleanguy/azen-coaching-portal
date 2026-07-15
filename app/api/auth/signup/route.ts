import { NextRequest, NextResponse } from "next/server";
import { getUser, saveUser, hashPassword, signToken } from "@/lib/auth";
import { addToIndex } from "@/lib/kv";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const existing = await getUser(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }
    const passwordHash = hashPassword(password);
    await saveUser(email, { name: name.trim(), email: email.trim(), passwordHash });
    await addToIndex(name.trim());

    const token = signToken({ email: email.trim(), name: name.trim(), role: "client" });
    const res = NextResponse.json({ ok: true, name: name.trim() });
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
