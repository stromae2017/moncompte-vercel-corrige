import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!phone) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { phone }
    });

    // Réponse volontairement générique pour ne pas révéler
    // si un numéro existe dans la base.
    if (!user) {
      return NextResponse.json({
        message:
          "Si ce numéro correspond à un compte, tu recevras les instructions de réinitialisation."
      });
    }

    return NextResponse.json({
      message:
        "La demande a été enregistrée. L'envoi du code SMS sera activé dès que le service SMS sera configuré."
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);

    return NextResponse.json(
      { error: "Impossible de traiter la demande." },
      { status: 500 }
    );
  }
}
