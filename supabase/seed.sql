-- Run this after creating the three Auth users in Supabase Dashboard:
-- student@verdantlearning.demo / DemoStudent123!
-- instructor@verdantlearning.demo / DemoInstructor123!
-- admin@verdantlearning.demo / DemoAdmin123!

insert into public.categories (name, slug, description) values
  ('Product & strategy', 'product-strategy', 'Make better decisions and build useful things.'),
  ('Communication', 'communication', 'Write and communicate with clarity.'),
  ('Creative practice', 'creative-practice', 'Build a sustainable creative habit.'),
  ('Leadership', 'leadership', 'Lead people and projects with clarity.'),
  ('Research', 'research', 'Ask better questions and find useful answers.')
on conflict (slug) do update set description = excluded.description;

insert into public.profiles (id, email, full_name, role)
select id, email, coalesce(nullif(raw_user_meta_data ->> 'full_name', ''), split_part(email, '@', 1)), 'student'::public.user_role
from auth.users
where email in ('student@verdantlearning.demo', 'instructor@verdantlearning.demo', 'admin@verdantlearning.demo')
on conflict (id) do update set email = excluded.email;

-- The signup trigger creates profiles automatically. These updates promote the demo accounts.
update public.profiles set full_name = 'Jordan Ellis', role = 'student'
where id = (select id from auth.users where email = 'student@verdantlearning.demo');
update public.profiles set full_name = 'Maya Chen', role = 'instructor'
where id = (select id from auth.users where email = 'instructor@verdantlearning.demo');
update public.profiles set full_name = 'Avery Morgan', role = 'admin'
where id = (select id from auth.users where email = 'admin@verdantlearning.demo');

-- Seed a complete published course when the instructor account exists.
do $$
declare
  v_instructor_id uuid;
  v_category_id uuid;
  v_course_id uuid;
  v_module_id uuid;
  v_lesson_one_id uuid;
  v_quiz_id uuid;
  v_question_one_id uuid;
  v_student_id uuid;
begin
  select p.id into v_instructor_id from public.profiles p where p.email = 'instructor@verdantlearning.demo' limit 1;
  select p.id into v_student_id from public.profiles p where p.email = 'student@verdantlearning.demo' limit 1;
  select c.id into v_category_id from public.categories c where c.slug = 'product-strategy' limit 1;

  if v_instructor_id is null then
    raise notice 'Create instructor@verdantlearning.demo in Auth, then rerun this seed.';
    return;
  end if;

  insert into public.courses (instructor_id, category_id, title, slug, description, level, status, published_at)
  values (v_instructor_id, v_category_id, 'Foundations of Product Thinking', 'foundations-of-product-thinking', 'Learn a practical framework for understanding people, problems, and the products that serve them.', 'beginner', 'published', now())
  on conflict (slug) do update set description = excluded.description, status = 'published', published_at = coalesce(public.courses.published_at, now())
  returning id into v_course_id;

  if v_course_id is null then
    select c.id into v_course_id from public.courses c where c.slug = 'foundations-of-product-thinking';
  end if;

  insert into public.modules (course_id, title, description, position)
  values (v_course_id, 'Start with the problem', 'Build the habit of seeing the real problem before jumping to solutions.', 1)
  on conflict (course_id, position) do update set title = excluded.title
  returning id into v_module_id;

  insert into public.lessons (module_id, title, lesson_type, content, duration_minutes, position, is_preview)
  values (v_module_id, 'A useful way to look closer', 'text', 'Good product thinking starts with attention. Notice what people do, what they avoid, and where the current experience creates friction.', 25, 1, true)
  on conflict (module_id, position) do update set content = excluded.content
  returning id into v_lesson_one_id;

  insert into public.lessons (module_id, title, lesson_type, content, duration_minutes, position)
  values (v_module_id, 'From observation to insight', 'text', 'Turn observations into a clear opportunity statement that can guide the rest of your work.', 35, 2)
  on conflict (module_id, position) do update set content = excluded.content;

  insert into public.quizzes (course_id, lesson_id, title, description, time_limit_minutes, passing_score)
  values (v_course_id, v_lesson_one_id, 'Foundations check-in', 'A short check-in to reinforce the first module.', 10, 70)
  returning id into v_quiz_id;

  if v_quiz_id is null then
    select q.id into v_quiz_id from public.quizzes q where q.course_id = v_course_id and q.title = 'Foundations check-in' limit 1;
  end if;

  insert into public.questions (quiz_id, question_text, question_type, position, points)
  values (v_quiz_id, 'What should product thinking begin with?', 'multiple_choice', 1, 1)
  returning id into v_question_one_id;

  insert into public.options (question_id, option_text, is_correct, position) values
    (v_question_one_id, 'A clear understanding of the problem', true, 1),
    (v_question_one_id, 'A polished visual design', false, 2),
    (v_question_one_id, 'A launch announcement', false, 3);

  insert into public.announcements (course_id, author_id, title, body, published_at)
  values (v_course_id, v_instructor_id, 'Welcome to the course', 'Start with the first lesson and keep a note of one problem you notice in your own work this week.', now());

  if v_student_id is not null then
    insert into public.enrolments (student_id, course_id) values (v_student_id, v_course_id) on conflict do nothing;
  end if;
end $$;
