"use client";

import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Impossible de traiter la demande.");
      }

      setMessage(data.message || "La demande a été prise en compte.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Erreur serveur."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="hero">
      <section>
        <div className="tag">Réinitialisation</div>
        <h1>Mot de passe oublié ?</h1>
        <p>
          Entre ton numéro de téléphone pour recevoir les instructions
          permettant de réinitialiser ton mot de passe.
        </p>

        <form className="card" onSubmit={submit}>
          <h2>Réinitialiser mon mot de passe</h2>

          {message && <div className="error">{message}</div>}

          <div className="field">
            <label>Numéro de téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225..."
              required
            />
          </div>

          <button className="primary" disabled={loading}>
            {loading ? "Traitement..." : "Réinitialiser mon mot de passe"}
          </button>
        </form>
      </section>
    </main>
  );
}
