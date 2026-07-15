import { NextRequest, NextResponse } from "next/server";
import { getUser, verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 });
    }
    const user = await getUser(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }
    const token = signToken({ email: user.email, name: user.name, role: "client" });
    const res = NextResponse.json({ ok: true, name: user.name });
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
