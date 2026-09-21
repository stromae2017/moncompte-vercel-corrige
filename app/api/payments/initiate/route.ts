import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Connecte-toi avant de recharger." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const value = Number(body.amount);

    if (!Number.isInteger(value) || value < 100 || value > 10000000) {
      return NextResponse.json(
        { error: "Montant invalide (minimum 100 XOF)." },
        { status: 400 }
      );
    }

    const masterKey = process.env.PAYDUNYA_MASTER_KEY;
    const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
    const token = process.env.PAYDUNYA_TOKEN;
    const mode = process.env.PAYDUNYA_MODE || "test";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!masterKey || !privateKey || !token || !siteUrl) {
      return NextResponse.json(
        { error: "Le paiement PayDunya n'est pas encore configuré." },
        { status: 500 }
      );
    }

    const transactionId = `MC_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    const endpoint =
      mode === "live"
        ? "https://app.paydunya.com/api/v1/checkout-invoice/create"
        : "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create";

    const payload = {
      invoice: {
        total_amount: value,
        description: `Recharge MonCompte - ${transactionId}`,
      },
      store: {
        name: "MonCompte",
        website_url: siteUrl,
      },
      custom_data: {
        transactionId,
        userId,
      },
      actions: {
        return_url: siteUrl,
        cancel_url: siteUrl,
      },
    };

    const paydunyaResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-MASTER-KEY": masterKey,
        "PAYDUNYA-PRIVATE-KEY": privateKey,
        "PAYDUNYA-TOKEN": token,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await paydunyaResponse.json();

    if (
      !paydunyaResponse.ok ||
      data.response_code !== "00" ||
      !data.response_text
    ) {
      console.error("PAYDUNYA_CREATE_ERROR", data);

      return NextResponse.json(
        {
          error:
            data.response_text ||
            "Impossible de créer la facture PayDunya.",
        },
        { status: 502 }
      );
    }

    await db.payment.create({
      data: {
        transactionId,
        amount: value,
        userId,
      },
    });

    return NextResponse.json({
      ok: true,
      transactionId,
      paymentUrl: data.response_text,
      token: data.token,
    });
  } catch (error) {
    console.error("PAYMENT_INIT_ERROR", error);

    return NextResponse.json(
      { error: "Impossible d'initialiser le paiement." },
      { status: 500 }
    );
  }
}
