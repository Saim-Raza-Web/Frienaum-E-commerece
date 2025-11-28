import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      setErr(data.message || "Login failed");
      return;
    }
    const data = await res.json();
    // both Admin & Merchant go to the same dashboard
    r.push("/dashboard/products");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">Sign in</h1>
        {err && <p className="text-red-600 mb-2">{err}</p>}
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded p-2" />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded p-2 text-gray-900" />
        </label>
        <button className="w-full rounded-2xl p-2 border shadow">Login</button>
      </form>
    </div>
  );
}
