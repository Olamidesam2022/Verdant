import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CatalogueCourse = {
  id: string;
  category: string;
  title: string;
  instructor: string;
  duration: string;
  tone: string;
};

const demoCourses: CatalogueCourse[] = [
  { id: "demo-product", category: "Product & strategy", title: "Foundations of Product Thinking", instructor: "Maya Chen", duration: "2h 40m", tone: "bg-[#dcecdf]" },
  { id: "demo-writing", category: "Communication", title: "Writing for clear ideas", instructor: "Daniel Okafor", duration: "3h 15m", tone: "bg-[#f1e5ce]" },
  { id: "demo-creative", category: "Creative practice", title: "The creative practice", instructor: "Lina Hart", duration: "1h 50m", tone: "bg-[#e7e6df]" },
  { id: "demo-leadership", category: "Leadership", title: "Leading with clarity", instructor: "Nora Williams", duration: "4h 05m", tone: "bg-[#e5eee8]" },
  { id: "demo-research", category: "Research", title: "Ask better questions", instructor: "Theo Martins", duration: "2h 10m", tone: "bg-[#eee6d7]" },
  { id: "demo-wellbeing", category: "Wellbeing", title: "The sustainable pace", instructor: "Amara Singh", duration: "1h 35m", tone: "bg-[#e3e9e1]" },
];

export async function getCatalogueCourses(): Promise<CatalogueCourse[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoCourses;

  const { data, error } = await supabase
    .from("courses")
    .select("id, title, instructor_id, categories(name), profiles!courses_instructor_id_fkey(full_name), modules(lessons(duration_minutes))")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data?.length) return demoCourses;

  return data.map((course, index) => {
    const category = Array.isArray(course.categories) ? course.categories[0] : course.categories;
    const profile = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles;
    const modules = Array.isArray(course.modules) ? course.modules : [];
    const minutes = modules.reduce((total, module) => {
      const lessons = Array.isArray(module.lessons) ? module.lessons : [];
      return total + lessons.reduce((lessonTotal, lesson) => lessonTotal + (lesson.duration_minutes ?? 0), 0);
    }, 0);

    return {
      id: course.id,
      category: category?.name ?? "General learning",
      title: course.title,
      instructor: profile?.full_name ?? "Verdant instructor",
      duration: `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
      tone: ["bg-[#dcecdf]", "bg-[#f1e5ce]", "bg-[#e7e6df]"][index % 3],
    };
  });
}
