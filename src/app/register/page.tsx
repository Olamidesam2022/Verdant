"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Leaf, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw error;
      if (data.session) router.push("/dashboard");
      else setMessage("Account created. Check your email to confirm your account, then sign in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create your account. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-10 flex items-center justify-center gap-2.5 text-lg font-bold tracking-tight text-[#14532D]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14532D] text-white"><Leaf size={19} /></span> verdant<span className="font-normal text-stone-500">learning</span></Link><div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9"><Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-[#14532D]"><ArrowLeft size={14} /> Back home</Link><h1 className="mt-8 font-serif text-4xl tracking-tight text-stone-900">Start learning</h1><p className="mt-2 text-stone-500">Create your free student account.</p><p className="mt-4 rounded-lg bg-[#ECFDF3] p-3 text-xs leading-5 text-[#14532D]">New accounts start as students. Instructor and admin access is assigned by the platform team after approval.</p><form onSubmit={handleSubmit} className="mt-6 space-y-5"><Field label="Full name" type="text" value={name} onChange={setName} required /><Field label="Email" type="email" value={email} onChange={setEmail} required /><Field label="Password" type="password" value={password} onChange={setPassword} required /><button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#14532D] px-4 py-3.5 font-semibold text-white hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-60">{pending && <LoaderCircle className="animate-spin" size={17} />} Create student account</button>{message && <p role="status" className="rounded-lg bg-[#ECFDF3] p-3 text-sm text-[#14532D]">{message}</p>}</form><p className="mt-6 text-center text-sm text-stone-500">Already have an account? <Link href="/login" className="font-bold text-[#14532D]">Sign in</Link></p></div></div></main>;
}

function Field({ label, type, value, onChange, required }: { label: string; type: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="block text-sm font-semibold text-stone-700">{label}<input type={type} value={value} required={required} minLength={type === "password" ? 8 : undefined} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 font-normal outline-none transition focus:border-[#14532D] focus:ring-2 focus:ring-[#ECFDF3]" /></label>;
}
