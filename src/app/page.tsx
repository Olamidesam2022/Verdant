import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Leaf, PlayCircle, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="border-b border-stone-200 bg-white/90">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#14532D]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14532D] text-white"><Leaf size={19} strokeWidth={2.5} /></span>
            verdant<span className="font-normal text-stone-500">learning</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex" aria-label="Main navigation">
            <Link className="text-[#14532D]" href="/catalogue">Explore courses</Link>
            <Link className="hover:text-[#14532D]" href="/how-it-works">How it works</Link>
            <Link className="hover:text-[#14532D]" href="/about">About us</Link>
          </nav>
          <div className="flex items-center gap-2"><Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-stone-700 hover:text-[#14532D] sm:block">Log in</Link><Link href="/register" className="hidden rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-700 hover:border-[#14532D] hover:text-[#14532D] sm:block">Create account</Link><Link href="/catalogue" className="rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166534]">Start learning</Link></div>
        </div>
      </header>

      <main>
        <section className="relative border-b border-stone-200 bg-[#f3f8f1]">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.03fr_.97fr] lg:px-8 lg:py-28">
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#bbdec5] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#14532D]"><Sparkles size={14} /> Learn with intention</div>
              <h1 className="max-w-2xl font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">Make room for <span className="text-[#14532D]">better</span> thinking.</h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-stone-600">Practical, beautifully structured courses for people who want to grow their skills and their perspective.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/catalogue" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14532D] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#166534]">Browse all courses <ArrowRight size={17} /></Link><Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-3.5 font-semibold text-stone-700 transition hover:border-[#14532D] hover:text-[#14532D]"><PlayCircle size={17} /> See how it works</Link></div>
              <div className="mt-12 flex items-center gap-8 text-sm text-stone-500"><span className="flex items-center gap-2"><CheckCircle2 size={17} className="text-[#15803D]" /> Self-paced learning</span><span className="flex items-center gap-2"><CheckCircle2 size={17} className="text-[#15803D]" /> Expert instructors</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-lg lg:ml-auto"><div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#b8d5bc]" /><div className="relative overflow-hidden rounded-2xl border border-[#d4e4d5] bg-white p-5 shadow-[0_20px_50px_rgba(20,83,45,0.12)]"><div className="flex items-center justify-between border-b border-stone-100 pb-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Your learning path</p><p className="mt-1 text-lg font-bold text-stone-900">A thoughtful start</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECFDF3] text-[#14532D]"><BookOpen size={19} /></div></div><div className="mt-5 space-y-4"><PathRow number="01" title="Foundations of Product Thinking" meta="6 lessons · 2h 40m" progress="82%" /><PathRow number="02" title="Writing for clear ideas" meta="8 lessons · 3h 15m" progress="34%" /><PathRow number="03" title="The creative practice" meta="5 lessons · 1h 50m" progress="0%" /></div><div className="mt-5 flex items-center justify-between rounded-xl bg-[#f8faf7] p-3 text-sm"><span className="flex items-center gap-2 text-stone-600"><Clock3 size={16} className="text-[#B45309]" /> 4h 20m this week</span><span className="font-bold text-[#14532D]">On track</span></div></div></div>
          </div>
        </section>

        <section id="courses" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-[#B45309]">Curated for curiosity</p><h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-900">Find your next direction.</h2></div><Link href="/catalogue" className="inline-flex items-center gap-2 text-sm font-bold text-[#14532D]">View all courses <ArrowRight size={16} /></Link></div><div className="mt-10 grid gap-5 md:grid-cols-3"><CourseCard tone="sage" category="Product & strategy" title="Foundations of Product Thinking" instructor="Maya Chen" duration="2h 40m" /><CourseCard tone="sand" category="Communication" title="Writing for clear ideas" instructor="Daniel Okafor" duration="3h 15m" /><CourseCard tone="stone" category="Creative practice" title="The creative practice" instructor="Lina Hart" duration="1h 50m" /></div></section>

        <section id="how-it-works" className="border-y border-stone-200 bg-white"><div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-[#B45309]">A calmer way to learn</p><h2 className="mt-3 max-w-md font-serif text-4xl leading-tight text-stone-900">Good learning needs a little space.</h2></div><div className="grid gap-8 sm:grid-cols-3"><Step number="01" title="Choose a course" text="Follow your curiosity with a focused, practical curriculum." /><Step number="02" title="Learn at your pace" text="Make progress in small, satisfying sessions that fit your life." /><Step number="03" title="Put it to work" text="Build confidence through projects, reflection, and practice." /></div></div></section>
      </main>
      <footer id="about" className="bg-[#14532D] text-white"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-2.5 text-lg font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><Leaf size={17} /></span> verdant<span className="font-normal text-white/65">learning</span></div><p className="text-sm text-white/65">Make room for better thinking.</p><Link href="/catalogue" className="text-sm font-semibold text-white/85">Explore courses <ArrowRight className="ml-1 inline" size={15} /></Link></div></footer>
    </div>
  );
}

function PathRow({ number, title, meta, progress }: { number: string; title: string; meta: string; progress: string }) {
  return <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF3] text-xs font-bold text-[#14532D]">{number}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="truncate text-sm font-bold text-stone-800">{title}</p><span className="text-xs font-bold text-[#14532D]">{progress}</span></div><p className="mt-1 text-xs text-stone-500">{meta}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-[#579267]" style={{ width: progress }} /></div></div></div>;
}

function CourseCard({ tone, category, title, instructor, duration }: { tone: "sage" | "sand" | "stone"; category: string; title: string; instructor: string; duration: string }) {
  const tones = { sage: "bg-[#dcecdf]", sand: "bg-[#f1e5ce]", stone: "bg-[#e7e6df]" };
  return <Link href="/catalogue" className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-[#9ac2a3] hover:shadow-lg"><div className={`relative flex h-44 items-end overflow-hidden p-5 ${tones[tone]}`}><div className="absolute right-5 top-5 flex h-16 w-16 items-center justify-center rounded-full border border-black/10 text-[#14532D]"><Leaf size={28} strokeWidth={1.3} /></div><span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-[#14532D]">{category}</span></div><div className="p-5"><h3 className="text-lg font-bold leading-snug text-stone-900 group-hover:text-[#14532D]">{title}</h3><div className="mt-5 flex items-center justify-between text-xs text-stone-500"><span>By {instructor}</span><span>{duration}</span></div></div></Link>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <div><span className="text-sm font-bold text-[#B45309]">{number}</span><h3 className="mt-3 text-base font-bold text-stone-900">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-500">{text}</p></div>;
}
