"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"register"|"login">("register");
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setError(""); setLoading(true); try {
    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const payload = mode === "register" ? { name, phone, password } : { phone, password };
    const res = await fetch(endpoint, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    const data = await res.json().catch(()=>({})); if (!res.ok) throw new Error(data.error || "Erreur serveur."); router.push("/dashboard"); router.refresh();
  } catch(err) { setError(err instanceof Error ? err.message : "Erreur serveur."); } finally { setLoading(false); } }
  return <><nav className="nav"><div className="logo">Mon<span>Compte</span></div><button className="linkbtn" onClick={()=>{setMode(mode==="register"?"login":"register");setError("")}}>{mode==="register"?"Se connecter":"Créer un compte"}</button></nav>
  <main className="hero"><section><div className="tag">Recharge mobile money</div><h1>Crée ton compte et recharge en quelques clics.</h1><p>Une expérience simple pour gérer ton solde et payer via Wave, Orange Money, MTN MoMo ou Moov Money.</p></section>
  <form className="card" onSubmit={submit}><h2>{mode==="register"?"Créer mon compte":"Se connecter"}</h2>{error&&<div className="error">{error}</div>}
  {mode==="register"&&<div className="field"><label>Nom / pseudo</label><input value={name} onChange={e=>setName(e.target.value)} required /></div>}
  <div className="field"><label>Numéro de téléphone</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+225..." required /></div>
  <div className="field"><label>Mot de passe</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required /></div>
    {mode === "login" && (
  <button
    type="button"
    onClick={() => router.push("/forgot-password")}
  >
    Mot de passe oublié ?
  </button>
)}
  <button className="primary" disabled={loading}>{loading?"Patiente...":mode==="register"?"Créer mon compte":"Se connecter"}</button><div className="small">Les clés de paiement restent côté serveur.</div></form></main></>;
}
