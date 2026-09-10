import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");

    if (!name || !phone || !password || password.length < 6) {
      return NextResponse.json({ error: "Nom, téléphone et mot de passe (6 caractères minimum) requis." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "Ce numéro est déjà utilisé." }, { status: 409 });
    }

    const user = await db.user.create({
      data: { name, phone, passwordHash: await bcrypt.hash(password, 12) }
    });

    await setSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: process.env.NODE_ENV === "production" ? "Impossible de créer le compte. Vérifie la configuration du serveur." : message }, { status: 500 });
  }
}
