import type { Lang } from "@/lib/language";

export function formatPrice(price: number | null, currency: string, lang: Lang = "en") {
  if (price == null) return lang === "ar" ? "السعر عند الطلب" : "Price on request";
  if (price === 0) return lang === "ar" ? "مجاني" : "Free";
  return `${new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "en-US").format(price)} ${currency}`;
}

export function formatDate(d: string | null, lang: Lang = "en") {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ageFromBirthDate(d: string | null): number | null {
  if (!d) return null;
  const b = new Date(d + "T00:00:00");
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
