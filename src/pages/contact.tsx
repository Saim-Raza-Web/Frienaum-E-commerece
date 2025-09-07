import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(false);
    const res = await fetch("/api/contact", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form)
    });
    if (res.ok) { setOk(true); setForm({ name:"", email:"", subject:"", message:"" }); }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      {ok && <div className="p-3 border rounded bg-green-50 mb-3">Message sent!</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="w-full border p-2 rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="w-full border p-2 rounded" placeholder="Subject" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})}/>
        <textarea className="w-full border p-2 rounded" rows={5} placeholder="Message" value={form.message} onChange={e=>setForm({...form, message:e.target.value})}/>
        <button className="border rounded-2xl px-4 py-2">Send</button>
      </form>
    </div>
  );
}
