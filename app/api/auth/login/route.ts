import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    if (!phone || !password) return NextResponse.json({ error: "Téléphone et mot de passe requis." }, { status: 400 });

    const user = await db.user.findUnique({ where: { phone } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Téléphone ou mot de passe incorrect." }, { status: 401 });
    }
    await setSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json({ error: "Impossible de se connecter. Vérifie la configuration du serveur." }, { status: 500 });
  }
}
