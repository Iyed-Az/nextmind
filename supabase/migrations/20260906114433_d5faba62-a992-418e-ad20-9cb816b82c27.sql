CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  ages TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  points TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'DZD',
  duration TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL DEFAULT '',
  start_date DATE,
  max_seats INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon, authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published programs are publicly readable"
  ON public.programs FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  birth_date DATE,
  guardian_name TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TYPE public.enrollment_status AS ENUM ('pending', 'approved', 'declined');

CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  status public.enrollment_status NOT NULL DEFAULT 'pending',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, program_id)
);
GRANT SELECT, INSERT, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users request enrollment" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Users cancel pending enrollment" ON public.enrollments FOR DELETE TO authenticated USING (auth.uid() = user_id AND status = 'pending');
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX enrollments_program_idx ON public.enrollments(program_id);

INSERT INTO public.programs (title, ages, description, points, duration, schedule, sort_order) VALUES
('Digital Arts', 'Ages 8+ & adults', 'Illustration, digital painting, animation and photo editing on tablets — from first strokes to a finished portfolio piece.', ARRAY['Drawing & illustration','2D animation basics','Photo & video editing'], '8 weeks', 'Saturdays 10:00–12:00', 1),
('Design', 'Teens & adults', 'Graphic design, branding and product/UI design taught the way studios work: brief, sketch, iterate, present.', ARRAY['Graphic & brand design','UI/UX fundamentals','Portfolio & client work'], '10 weeks', 'Tue & Thu 17:00–19:00', 2),
('Innovation & Tech', 'Ages 7+', 'Coding, robotics and creative problem solving. Learners build, break and rebuild projects they actually care about.', ARRAY['Coding & game building','Robotics & electronics','AI & digital literacy'], '8 weeks', 'Saturdays 14:00–16:00', 3);