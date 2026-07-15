import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || password !== process.env.COACH_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }
    const token = signToken({ role: "coach" });
    const res = NextResponse.json({ ok: true });
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
