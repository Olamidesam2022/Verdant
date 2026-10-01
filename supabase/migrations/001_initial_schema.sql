create extension if not exists "uuid-ossp";

create type public.user_role as enum ('student', 'instructor', 'admin');
create type public.course_status as enum ('draft', 'pending_review', 'published', 'unpublished');
create type public.course_level as enum ('beginner', 'intermediate', 'advanced');
create type public.lesson_type as enum ('video', 'text', 'quiz');
create type public.question_type as enum ('multiple_choice', 'true_false');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'student',
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  instructor_id uuid not null references public.profiles(id),
  category_id uuid references public.categories(id),
  title text not null,
  slug text not null unique,
  description text not null default '',
  thumbnail_url text,
  level public.course_level not null default 'beginner',
  status public.course_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  unique(course_id, position)
);

create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  lesson_type public.lesson_type not null default 'text',
  content text,
  video_url text,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  position integer not null default 0,
  is_preview boolean not null default false,
  unique(module_id, position)
);

create table public.enrolments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(student_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  last_position integer not null default 0,
  completed_at timestamptz,
  unique(student_id, lesson_id)
);

create table public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  title text not null,
  description text,
  time_limit_minutes integer check (time_limit_minutes > 0),
  passing_score integer not null default 70 check (passing_score between 0 and 100)
);

create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  question_type public.question_type not null,
  position integer not null default 0,
  points integer not null default 1 check (points > 0),
  unique(quiz_id, position)
);

create table public.options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  position integer not null default 0,
  unique(question_id, position)
);

create table public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score integer check (score between 0 and 100),
  passed boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table public.announcements (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  title text not null,
  body text not null,
  published_at timestamptz
);

create table public.course_files (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  certificate_number text not null unique,
  pdf_path text,
  issued_at timestamptz not null default now(),
  unique(course_id, student_id)
);

create or replace function public.current_user_role() returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.owns_course(course_uuid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.courses where id = course_uuid and instructor_id = auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrolments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.announcements enable row level security;
alter table public.course_files enable row level security;
alter table public.certificates enable row level security;

create policy "profiles are visible to authenticated users" on public.profiles for select to authenticated using (true);
create policy "users update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "public reads categories" on public.categories for select using (true);
create policy "public reads published courses" on public.courses for select using (status = 'published' or instructor_id = auth.uid() or public.current_user_role() = 'admin');
create policy "instructors create courses" on public.courses for insert to authenticated with check (instructor_id = auth.uid() and public.current_user_role() in ('instructor', 'admin'));
create policy "owners update courses" on public.courses for update to authenticated using (instructor_id = auth.uid() or public.current_user_role() = 'admin') with check (instructor_id = auth.uid() or public.current_user_role() = 'admin');
create policy "owners manage modules" on public.modules for all to authenticated using (public.owns_course(course_id) or public.current_user_role() = 'admin') with check (public.owns_course(course_id) or public.current_user_role() = 'admin');
create policy "read course modules" on public.modules for select using (exists(select 1 from public.courses c where c.id = course_id and (c.status = 'published' or c.instructor_id = auth.uid() or public.current_user_role() = 'admin')));
create policy "owners manage lessons" on public.lessons for all to authenticated using (exists(select 1 from public.modules m where m.id = module_id and public.owns_course(m.course_id)) or public.current_user_role() = 'admin') with check (exists(select 1 from public.modules m where m.id = module_id and public.owns_course(m.course_id)) or public.current_user_role() = 'admin');
create policy "students manage enrolments" on public.enrolments for all to authenticated using (student_id = auth.uid() or public.current_user_role() = 'admin') with check (student_id = auth.uid() or public.current_user_role() = 'admin');
create policy "students manage progress" on public.lesson_progress for all to authenticated using (student_id = auth.uid() or public.current_user_role() = 'admin') with check (student_id = auth.uid() or public.current_user_role() = 'admin');
create policy "course staff manage quizzes" on public.quizzes for all to authenticated using (public.owns_course(course_id) or public.current_user_role() = 'admin') with check (public.owns_course(course_id) or public.current_user_role() = 'admin');
create policy "students read published quizzes" on public.quizzes for select using (exists(select 1 from public.courses c where c.id = course_id and c.status = 'published'));
create policy "course staff manage questions" on public.questions for all to authenticated using (exists(select 1 from public.quizzes q where q.id = quiz_id and (public.owns_course(q.course_id) or public.current_user_role() = 'admin'))) with check (exists(select 1 from public.quizzes q where q.id = quiz_id and (public.owns_course(q.course_id) or public.current_user_role() = 'admin')));
create policy "read question options" on public.options for select to authenticated using (exists(select 1 from public.questions q where q.id = question_id));
create policy "students manage attempts" on public.quiz_attempts for all to authenticated using (student_id = auth.uid() or public.current_user_role() = 'admin') with check (student_id = auth.uid() or public.current_user_role() = 'admin');
create policy "course staff manage announcements" on public.announcements for all to authenticated using (public.owns_course(course_id) or public.current_user_role() = 'admin') with check (public.owns_course(course_id) or public.current_user_role() = 'admin');
create policy "students read certificates" on public.certificates for select to authenticated using (student_id = auth.uid() or public.current_user_role() = 'admin');
