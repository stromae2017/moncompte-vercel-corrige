import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, phone: true, balance: true } });
    if (!user) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("ME_ERROR", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
