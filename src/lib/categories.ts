export const PROGRAM_CATEGORIES = [
  { value: "Art & Digital Design", slug: "art-digital-design", ar: "الفنون والتصميم الرقمي" },
  { value: "Technology, IT & AI", slug: "technology-it-ai", ar: "التكنولوجيا والمعلوماتية والذكاء الاصطناعي" },
  { value: "Content Creation & Media Production", slug: "content-creation-media", ar: "صناعة المحتوى والإنتاج الإعلامي" },
  { value: "Languages & Communication", slug: "languages-communication", ar: "اللغات والتواصل" },
  { value: "Digital Marketing & Business", slug: "digital-marketing-business", ar: "التسويق الرقمي والأعمال" },
  { value: "Academic Support & Education", slug: "academic-support-education", ar: "الدعم الأكاديمي والتعليم" },
  { value: "Fashion & Creative Industries", slug: "fashion-creative-industries", ar: "الموضة والصناعات الإبداعية" },
  { value: "Administration, Secrétariat & GRH", slug: "administration-secretariat-grh", ar: "الإدارة والسكرتارية وتسيير الموارد البشرية" },
] as const;

export const PROGRAM_CATEGORY_VALUES = PROGRAM_CATEGORIES.map((c) => c.value) as [
  (typeof PROGRAM_CATEGORIES)[number]["value"],
  ...(typeof PROGRAM_CATEGORIES)[number]["value"][],
];

export function getCategoryBySlug(slug: string) {
  return PROGRAM_CATEGORIES.find((c) => c.slug === slug);
}
