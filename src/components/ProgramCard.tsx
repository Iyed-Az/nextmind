import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import type { PublicProgram } from "@/lib/programs.server";
import { formatDate, formatPrice } from "@/lib/format";
import { useLanguage, localizedProgram } from "@/lib/language";
import artsImg from "@/assets/program-arts.jpg";
import designImg from "@/assets/program-design.jpg";
import innovationImg from "@/assets/program-innovation.jpg";

const fallbackImages = [artsImg, designImg, innovationImg];

export function ProgramCard({
  p,
  i,
  loggedIn,
}: {
  p: PublicProgram;
  i: number;
  loggedIn: boolean;
}) {
  const { t, lang } = useLanguage();
  const loc = localizedProgram(p, lang);
  const full = p.max_seats != null && p.seats_taken >= p.max_seats;
  const left = p.max_seats != null ? Math.max(p.max_seats - p.seats_taken, 0) : null;
  return (
    <article
      style={{ ["--rd" as string]: `${(i % 3) * 100}ms` }}
      className="card-soft card-interactive reveal group flex h-full flex-col overflow-hidden !rounded-[1.5rem]"
    >
      <div className="relative overflow-hidden">
        <img
          src={p.image_url || fallbackImages[i % fallbackImages.length]}
          alt={loc.title}
          loading="lazy"
          width={1024}
          height={768}
          className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span dir="ltr" className="absolute start-4 top-4 rounded-full bg-brand-warm px-3.5 py-1 text-xs font-extrabold text-brand-deep shadow-soft">
          {p.ages}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h4 className="text-2xl font-extrabold leading-tight text-ink">
          {loc.title}
        </h4>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {loc.description}
        </p>
        <ul className="mt-5 space-y-2.5 text-sm text-foreground">
          {loc.points.map((pt) => (
            <li key={pt} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-deep text-brand-warm">
                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              </span>
              {pt}
            </li>
          ))}
        </ul>
        {(p.duration || p.schedule || p.start_date) && (
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-surface p-4 text-sm">
            {p.duration && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("duration")}</dt>
                <dd className="font-bold text-ink">{p.duration}</dd>
              </div>
            )}
            {p.schedule && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("schedule")}</dt>
                <dd className="font-bold text-ink">{p.schedule}</dd>
              </div>
            )}
            {p.start_date && (
              <div>
                <dt className="text-xs text-muted-foreground">{t("starts")}</dt>
                <dd className="font-bold text-ink">
                  {formatDate(p.start_date, lang)}
                </dd>
              </div>
            )}
          </dl>
        )}
        <div className="mt-auto pt-6">
          <div className="border-t border-border pt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("price")}</p>
                <p className="font-display text-2xl font-extrabold leading-tight text-ink">
                  {formatPrice(p.price, p.currency, lang, p.price_period)}
                </p>
              </div>
              {left != null && !full && (
                <span className="rounded-full bg-brand-warm-soft px-3 py-1 text-xs font-bold text-brand-deep">
                  {left} {t("seatsLeft")}
                </span>
              )}
            </div>
            {full ? (
              <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-center text-sm font-bold text-muted-foreground">
                {t("fullWaitlist")}
              </p>
            ) : loggedIn ? (
              <Link to="/dashboard" className="btn-primary mt-4 w-full !text-sm">
                {t("enrollNow")}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </Link>
            ) : (
              <Link
                to="/auth"
                search={{ mode: "signup", redirect: "/dashboard" }}
                className="btn-primary mt-4 w-full !text-sm"
              >
                {t("enrollNow")}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
