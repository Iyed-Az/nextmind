ALTER TABLE public.programs
  ADD COLUMN title_ar text NOT NULL DEFAULT '',
  ADD COLUMN description_ar text NOT NULL DEFAULT '',
  ADD COLUMN points_ar text[] NOT NULL DEFAULT '{}';

UPDATE public.programs SET
  title_ar = 'الفنون الرقمية',
  description_ar = 'من الرسم الرقمي إلى التحريك والتصوير. يتعلم المتدربون أدوات الاحتراف ويخرجون بأعمال جاهزة للعرض.',
  points_ar = ARRAY['الرسم والتلوين الرقمي', 'التحريك ومقاطع الفيديو القصيرة', 'مشاريع جاهزة للمحفظة الشخصية']
WHERE sort_order = 0 OR lower(title) LIKE '%art%';

UPDATE public.programs SET
  title_ar = 'التصميم',
  description_ar = 'التصميم الجرافيكي، الهوية البصرية وتجربة المستخدم. تفكير بصري عملي عبر مشاريع حقيقية.',
  points_ar = ARRAY['التصميم الجرافيكي والشعارات', 'واجهات وتجربة المستخدم', 'التعامل مع عملاء حقيقيين']
WHERE sort_order = 1 OR lower(title) LIKE '%design%';

UPDATE public.programs SET
  title_ar = 'الابتكار والتكنولوجيا',
  description_ar = 'البرمجة، الروبوتات والذكاء الاصطناعي للمبتدئين والشغوفين. بناء مشاريع تقنية خطوة بخطوة.',
  points_ar = ARRAY['أساسيات البرمجة', 'الروبوتات والإلكترونيات', 'مشاريع الذكاء الاصطناعي']
WHERE sort_order = 2 OR lower(title) LIKE '%innov%' OR lower(title) LIKE '%tech%';