"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Leaf, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Category = { id: string; name: string };

export default function NewCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("beginner");
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.from("categories").select("id, name").order("name").then(({ data }) => { const loaded = data ?? []; setCategories(loaded); setCategoryId(loaded[0]?.id ?? ""); });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in before creating a course.");
      const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { error } = await supabase.from("courses").insert({ instructor_id: user.id, title, slug, description, level, category_id: categoryId || null, status: "draft" });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create the course.");
    } finally {
      setPending(false);
    }
  }

  return <main className="min-h-screen bg-[#FAFAF7]"><header className="border-b border-stone-200 bg-white"><div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6 lg:px-8"><Link href="/dashboard" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#14532D]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14532D] text-white"><Leaf size={19} /></span> verdant<span className="font-normal text-stone-500">learning</span></Link><Link href="/dashboard" className="text-sm font-semibold text-stone-600">Account home</Link></div></header><div className="mx-auto max-w-3xl px-6 py-12 lg:px-8"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#14532D]"><ArrowLeft size={16} /> Back to account</Link><div className="mt-12"><p className="text-sm font-bold uppercase tracking-[0.15em] text-[#B45309]">Instructor workspace</p><h1 className="mt-3 font-serif text-5xl tracking-tight text-stone-900">Create a course.</h1><p className="mt-4 text-lg leading-8 text-stone-600">Start with the outline. You can add modules, lessons, files, and quizzes after saving the draft.</p></div><form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9"><label className="block text-sm font-semibold text-stone-700">Course title<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Foundations of Product Thinking" className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-3 font-normal outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#ECFDF3]" /></label><label className="block text-sm font-semibold text-stone-700">Description<textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="What will learners be able to do after this course?" className="mt-2 w-full resize-y rounded-lg border border-stone-300 px-4 py-3 font-normal outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#ECFDF3]" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-stone-700">Level<select value={level} onChange={(event) => setLevel(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#ECFDF3]"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label className="block text-sm font-semibold text-stone-700">Category<select disabled={!categories.length} value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#ECFDF3]"><option value="">{categories.length ? "Choose a category" : "Categories load after setup"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#14532D] px-5 py-3.5 font-semibold text-white hover:bg-[#166534] disabled:opacity-60">{pending && <LoaderCircle className="animate-spin" size={17} />} Save course draft</button>{message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-[#B91C1C]">{message}</p>}<p className="flex items-center gap-2 text-xs leading-5 text-stone-500"><BookOpen size={15} /> Only approved instructor or admin accounts can save courses.</p></form></div></main>;
}
