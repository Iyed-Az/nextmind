import { useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/language";
import type { TKey } from "@/lib/language";

export function ConsultationForm() {
  const { t } = useLanguage();
  const learnerKeys = ["learnerChild", "learnerTeen", "learnerAdult", "learnerGroup"] as const;
  const interestKeys = ["interestArts", "interestDesign", "interestTech", "interestUnsure"] as const;

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; learner: TKey; interest: TKey; message: string }>({
    name: "",
    email: "",
    learner: "learnerChild",
    interest: "interestArts",
    message: "",
  });

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Learner: ${t(form.learner)}`,
      `Interest: ${t(form.interest)}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:hello@nextmindacademy.com?subject=${encodeURIComponent(
      "Consultation request — NextMind Academy",
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field =
    "field-control bg-card text-sm";

  return (
    <form onSubmit={handleSubmit} className="inset-panel relative overflow-hidden p-5 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-accent" />
      <div className="mb-6 border-b border-border pb-5">
        <p className="font-display text-base font-extrabold text-ink">{t("requestConsultation")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="name" className="mb-2 block text-sm font-bold text-ink">
            {t("fullName")}
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={update("name")}
            placeholder={t("namePlaceholder")}
            className={field}
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-ink">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            placeholder="you@email.com"
            className={field}
            dir="ltr"
          />
        </div>
        <div>
          <label htmlFor="learner" className="mb-2 block text-sm font-bold text-ink">
            {t("whoLearning")}
          </label>
          <select id="learner" value={form.learner} onChange={update("learner")} className={field}>
            {learnerKeys.map((k) => (
              <option key={k} value={k}>
                {t(k)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="interest" className="mb-2 block text-sm font-bold text-ink">
            {t("interest")}
          </label>
          <select id="interest" value={form.interest} onChange={update("interest")} className={field}>
            {interestKeys.map((k) => (
              <option key={k} value={k}>
                {t(k)}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-2 block text-sm font-bold text-ink">
            {t("achieve")}
          </label>
          <textarea
            id="message"
            required
            rows={4}
            value={form.message}
            onChange={update("message")}
            placeholder={t("achievePlaceholder")}
            className={field}
          />
        </div>
      </div>
      <button type="submit" className="btn-primary mt-6 w-full sm:w-auto">
        {t("requestConsultation")}
        <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      </button>
      {sent && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary" role="status">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t("consultSent")}
        </p>
      )}
    </form>
  );
}
