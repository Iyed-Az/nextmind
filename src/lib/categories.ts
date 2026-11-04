export const PROGRAM_CATEGORIES = [
  { value: "Art & Digital Design", ar: "الفنون والتصميم الرقمي" },
  { value: "Technology, IT & AI", ar: "التكنولوجيا والمعلوماتية والذكاء الاصطناعي" },
  { value: "Content Creation & Media Production", ar: "صناعة المحتوى والإنتاج الإعلامي" },
  { value: "Languages & Communication", ar: "اللغات والتواصل" },
  { value: "Digital Marketing & Business", ar: "التسويق الرقمي والأعمال" },
  { value: "Academic Support & Education", ar: "الدعم الأكاديمي والتعليم" },
  { value: "Fashion & Creative Industries", ar: "الموضة والصناعات الإبداعية" },
  { value: "Administration, Secrétariat & GRH", ar: "الإدارة والسكرتارية وتسيير الموارد البشرية" },
] as const;

export const PROGRAM_CATEGORY_VALUES = PROGRAM_CATEGORIES.map((c) => c.value) as [
  (typeof PROGRAM_CATEGORIES)[number]["value"],
  ...(typeof PROGRAM_CATEGORIES)[number]["value"][],
];
