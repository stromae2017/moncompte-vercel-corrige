import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Connecte-toi avant de recharger." }, { status: 401 });
    const { amount } = await req.json();
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 100 || value > 10000000) {
      return NextResponse.json({ error: "Montant invalide (minimum 100 XOF)." }, { status: 400 });
    }
    const apiKey = process.env.CINETPAY_APIKEY;
    const siteId = process.env.CINETPAY_SITE_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!apiKey || !siteId || !siteUrl) {
      return NextResponse.json({ error: "Le paiement n'est pas encore configuré. Ajoute CINETPAY_APIKEY, CINETPAY_SITE_ID et NEXT_PUBLIC_SITE_URL dans Vercel." }, { status: 503 });
    }
    const transactionId = `MC-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    await db.payment.create({ data: { transactionId, amount: value, userId } });
    return NextResponse.json({ ok: true, transactionId, message: "Paiement enregistré en attente. Branche maintenant le checkout CinetPay avec tes identifiants marchands." });
  } catch (error) {
    console.error("PAYMENT_INIT_ERROR", error);
    return NextResponse.json({ error: "Impossible d'initialiser le paiement." }, { status: 500 });
  }
}
