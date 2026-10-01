-- Verdant Learning completion migration.
-- Run after 001_initial_schema.sql.

alter table public.profiles add column if not exists email text;
create index if not exists courses_status_idx on public.courses(status);
create index if not exists courses_category_idx on public.courses(category_id);
create index if not exists courses_instructor_idx on public.courses(instructor_id);
create index if not exists modules_course_position_idx on public.modules(course_id, position);
create index if not exists lessons_module_position_idx on public.lessons(module_id, position);
create index if not exists enrolments_student_idx on public.enrolments(student_id);
create index if not exists enrolments_course_idx on public.enrolments(course_id);
create index if not exists lesson_progress_student_idx on public.lesson_progress(student_id);
create index if not exists quiz_attempts_student_idx on public.quiz_attempts(student_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_enrolled(course_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrolments
    where course_id = course_uuid and student_id = auth.uid()
  );
$$;

create or replace function public.lesson_course(lesson_uuid uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.course_id from public.lessons l join public.modules m on m.id = l.module_id where l.id = lesson_uuid;
$$;

-- Replace broad policies with ownership-aware policies.
drop policy if exists "students manage enrolments" on public.enrolments;
create policy "students read own enrolments" on public.enrolments for select to authenticated
using (student_id = auth.uid() or public.owns_course(course_id) or public.current_user_role() = 'admin');
create policy "students enrol in published courses" on public.enrolments for insert to authenticated
with check (
  student_id = auth.uid()
  and exists (select 1 from public.courses where id = course_id and status = 'published')
);
create policy "students update own enrolments" on public.enrolments for update to authenticated
using (student_id = auth.uid() or public.current_user_role() = 'admin')
with check (student_id = auth.uid() or public.current_user_role() = 'admin');
create policy "students delete own enrolments" on public.enrolments for delete to authenticated
using (student_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "students manage progress" on public.lesson_progress;
create policy "students read progress" on public.lesson_progress for select to authenticated
using (student_id = auth.uid() or public.current_user_role() = 'admin' or public.owns_course(public.lesson_course(lesson_id)));
create policy "students write progress" on public.lesson_progress for insert to authenticated
with check (student_id = auth.uid() and public.is_enrolled(public.lesson_course(lesson_id)));
create policy "students update progress" on public.lesson_progress for update to authenticated
using (student_id = auth.uid() or public.current_user_role() = 'admin')
with check (student_id = auth.uid() or public.current_user_role() = 'admin');

create policy "read published lessons" on public.lessons for select to anon, authenticated
using (
  is_preview
  or exists (select 1 from public.modules m join public.courses c on c.id = m.course_id where m.id = module_id and c.status = 'published' and (auth.uid() is null or public.is_enrolled(c.id) or c.instructor_id = auth.uid() or public.current_user_role() = 'admin'))
);
create policy "students read enrolled modules" on public.modules for select to authenticated
using (public.is_enrolled(course_id) or public.owns_course(course_id) or public.current_user_role() = 'admin');

-- Never expose the answer key through the student-facing options table.
drop policy if exists "read question options" on public.options;
drop view if exists public.quiz_options;
create view public.quiz_options as
  select id, question_id, option_text, position
  from public.options;

grant select on public.quiz_options to anon, authenticated;
create policy "staff manage options" on public.options for all to authenticated
using (
  exists (select 1 from public.questions q join public.quizzes z on z.id = q.quiz_id where q.id = question_id and (public.owns_course(z.course_id) or public.current_user_role() = 'admin'))
)
with check (
  exists (select 1 from public.questions q join public.quizzes z on z.id = q.quiz_id where q.id = question_id and (public.owns_course(z.course_id) or public.current_user_role() = 'admin'))
);

create policy "students read own attempts" on public.quiz_attempts for select to authenticated
using (student_id = auth.uid() or public.current_user_role() = 'admin' or exists (select 1 from public.quizzes q where q.id = quiz_id and public.owns_course(q.course_id)));
create policy "students submit attempts" on public.quiz_attempts for insert to authenticated
with check (student_id = auth.uid() and public.is_enrolled((select course_id from public.quizzes where id = quiz_id)));
create policy "students update own attempts" on public.quiz_attempts for update to authenticated
using (student_id = auth.uid() or public.current_user_role() = 'admin')
with check (student_id = auth.uid() or public.current_user_role() = 'admin');

create policy "read course announcements" on public.announcements for select to anon, authenticated
using (
  published_at is not null
  and (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
    or public.is_enrolled(course_id)
    or public.owns_course(course_id)
    or public.current_user_role() = 'admin')
);
create policy "students read course files" on public.course_files for select to authenticated
using (
  exists (select 1 from public.lessons l where l.id = lesson_id and (l.is_preview or public.is_enrolled(public.lesson_course(l.id)) or public.owns_course(public.lesson_course(l.id)) or public.current_user_role() = 'admin'))
);
create policy "students read own certificates" on public.certificates for select to authenticated
using (student_id = auth.uid() or public.current_user_role() = 'admin');

insert into storage.buckets (id, name, public)
values ('course-files', 'course-files', false)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do nothing;

create policy "enrolled users download course files" on storage.objects for select to authenticated
using (
  bucket_id = 'course-files'
  and exists (select 1 from public.course_files f where f.storage_path = name and (public.is_enrolled(public.lesson_course(f.lesson_id)) or public.owns_course(public.lesson_course(f.lesson_id)) or public.current_user_role() = 'admin'))
);
create policy "course owners upload files" on storage.objects for insert to authenticated
with check (bucket_id = 'course-files' and public.current_user_role() in ('instructor', 'admin'));
create policy "certificate owners download certificates" on storage.objects for select to authenticated
using (bucket_id = 'certificates' and (name like auth.uid()::text || '/%' or public.current_user_role() = 'admin'));
