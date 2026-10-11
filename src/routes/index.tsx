import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ConsultationForm } from "@/components/ConsultationForm";
import { listPrograms } from "@/lib/programs.functions";
import type { PublicProgram } from "@/lib/programs.server";
import { formatDate, formatPrice } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, LanguageToggle, localizedProgram } from "@/lib/language";
import brandLogoLightUrl from "@/assets/nextmind-logo-brand-light.png";
import heroBgUrl from "@/assets/hero.jpg";
import loungeUrl from "@/assets/academy-space-hallway.jpg";
import classroomUrl from "@/assets/academy-space-classroom.jpg";
import ideasUrl from "@/assets/academy-space-ideas-process.jpg";
import workshopUrl from "@/assets/academy-space-5.jpg";
import artsImg from "@/assets/program-arts.jpg";
import designImg from "@/assets/program-design.jpg";
import innovationImg from "@/assets/program-innovation.jpg";
import {
  ArrowUpRight,
  Check,
  Compass,
  Instagram,
  Menu,
  X,
} from "lucide-react";

/* Custom line-art SVGs in place of generic template icons.
   currentColor makes them pick up the chip color (navy on gold, white on royal). */
function SvgClasses() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <circle cx="8.2" cy="8" r="2.4" />
      <path d="M4.4 18.2c0-2.7 1.6-4.2 3.8-4.2s3.8 1.5 3.8 4.2" />
      <circle cx="16.8" cy="9.2" r="2" />
      <path d="M14 18.2c.3-2.1 1.4-3.4 2.8-3.4s2.5 1.3 2.8 3.4" />
    </svg>
  );
}

function SvgPortfolio() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 8.5h18" />
      <path d="M6.2 6.5h.01M8.6 6.5h.01" />
      <path d="M7 14.5l2.4-2.4 2 2 3.2-3.2 2.2 2.2" />
    </svg>
  );
}

function SvgAges() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <circle cx="9" cy="8.5" r="2.6" />
      <path d="M5.2 18.2c0-2.9 1.7-4.6 3.8-4.6s3.8 1.7 3.8 4.6" />
      <circle cx="17.2" cy="12" r="1.9" />
      <path d="M15 18.2c.2-1.9 1-3 2.2-3s2 1.1 2.2 3" />
    </svg>
  );
}

function SvgSchedule() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.6h16M8 3v3.6M16 3v3.6" />
      <circle cx="12" cy="14.2" r="3.2" />
      <path d="M12 12.8v1.8l1.4 1.1" />
    </svg>
  );
}

export const Route = createFileRoute("/")({
  loader: () => listPrograms(),
  head: () => ({
    meta: [
      { title: "أكاديمية نكست مايند — فنون رقمية، تصميم وابتكار" },
      {
        name: "description",
        content:
          "ورشات ودورات عملية في الفنون الرقمية والتصميم والابتكار للأطفال والمراهقين والكبار. احجز استشارة مجانية مع أكاديمية نكست مايند.",
      },
      { property: "og:title", content: "أكاديمية نكست مايند — فنون رقمية، تصميم وابتكار" },
      {
        property: "og:description",
        content:
          "دورات إبداعية وتقنية للأطفال والمراهقين والكبار. أقسام صغيرة، مشاريع حقيقية، مشرفون خبراء. احجز استشارتك المجانية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const campusImages = {
  lounge: loungeUrl,
  classroom: classroomUrl,
  ideas: ideasUrl,
  workshop: workshopUrl,
};
const fallbackImages = [artsImg, designImg, innovationImg];

export const SCHOOL_COORDS = { lat: 36.901422037922536, lng: 7.759429660795954 };
const mapEmbedUrl = `https://www.google.com/maps?q=${SCHOOL_COORDS.lat},${SCHOOL_COORDS.lng}&z=16&hl=ar&output=embed`;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${SCHOOL_COORDS.lat},${SCHOOL_COORDS.lng}`;

function Index() {
  const programs = Route.useLoaderData() as PublicProgram[];
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  // Hide the floating mobile CTA once the booking form is on screen.
  const [bookingVisible, setBookingVisible] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const el = document.getElementById("book");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setBookingVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.15 },
    );
    io.observe(el);
    const onScroll = () => {
      setPastHero(window.scrollY > 700);
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Reveal-on-scroll: any .reveal element fades up once the user reaches it.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".reveal").forEach((n) => n.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const steps = [
    { n: "1", title: t("step1Title"), copy: t("step1Copy") },
    { n: "2", title: t("step2Title"), copy: t("step2Copy") },
    { n: "3", title: t("step3Title"), copy: t("step3Copy") },
  ];
  const stats = [
    { value: "3", label: t("statAcademies") },
    { value: "8+", label: t("statTracks") },
    { value: "1:6", label: t("statMentor") },
    { value: "100%", label: t("statProjects") },
  ];
  const features = [
    { svg: <SvgClasses />, t: t("featSmall"), c: t("featSmallC") },
    { svg: <SvgPortfolio />, t: t("featReal"), c: t("featRealC") },
    { svg: <SvgAges />, t: t("featAges"), c: t("featAgesC") },
    { svg: <SvgSchedule />, t: t("featFlex"), c: t("featFlexC") },
  ];
  const campus = [
    { src: campusImages.ideas, label: t("campusIdeas") },
    { src: campusImages.classroom, label: t("campusClassroom") },
    { src: campusImages.lounge, label: t("campusWelcome") },
    { src: campusImages.workshop, label: t("campusCollaboration") },
  ];
  const tagline = t("heroEyebrow").split("·").map((part) => part.trim());
  const navLinks = [
    { href: "#programs", label: t("programs") },
    { href: "#how", label: t("howItWorks") },
    { href: "#about", label: t("about") },
    { href: "#campus", label: t("campus") },
    { href: "#location", label: t("findUs") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-warm focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-brand-deep focus:shadow-lift"
      >
        {t("skipToContent")}
      </a>

      {/* ───────── Header ───────── */}
      <header className="on-dark sticky top-0 z-50 text-white">
        <nav className="w-full">
          <div className={`border-b border-white/10 bg-brand-deep backdrop-blur-xl transition-all duration-300 ${scrolled ? "shadow-lift bg-brand-deep/95" : "bg-brand-deep/80"}`}>
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <a href="#top" className="flex min-w-0 items-center" aria-label="NextMind Academy">
              <img
                src={brandLogoLightUrl}
                alt="NextMind Academy"
                width={900}
                height={288}
                className="h-12 w-auto object-contain sm:h-[3.5rem]"
              />
            </a>

            <div className="hidden items-center gap-1 rounded-full bg-white/5 p-1.5 xl:flex">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="nav-link rounded-full px-4 py-3 text-[0.95rem] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-brand-warm"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <LanguageToggle tone="dark" className="hidden sm:inline-flex" />
              {user ? (
                <Link to="/dashboard" className="btn-outline-light !px-5 !py-3 !text-sm">
                  {t("mySpace")}
                </Link>
              ) : (
                <Link to="/auth" className="btn-outline-light !px-5 !py-3 !text-sm">
                  {t("studentLogin")}
                </Link>
              )}
              <a href="#book" className="btn-primary hidden !px-6 !py-3 !text-sm md:inline-flex">
                {t("bookConsultation")}
              </a>
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="flex size-12 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/15 xl:hidden"
              >
                {mobileOpen ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <Menu className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          </div>

          {mobileOpen && (
            <div className="w-full">
              {/* Click-outside backdrop closes the menu */}
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                className="fixed inset-0 z-40 cursor-default bg-transparent xl:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <div className="relative z-50 mx-4 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-brand-deep/95 p-3 shadow-lift backdrop-blur-xl sm:mx-auto sm:max-w-6xl xl:hidden">
                <LanguageToggle tone="dark" className="mb-2 sm:hidden" />
              <ul className="space-y-1">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-brand-warm"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="#book"
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-3 w-full justify-center !text-sm md:hidden"
              >
                {t("bookConsultation")}
              </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main id="top">
        {/* ───────── Hero ───────── */}
        <section className="on-dark relative isolate overflow-hidden bg-brand-deep text-white">
          {/* Hero photo background */}
          <img
            src={heroBgUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Soft royal-blue overlay so the copy stays readable */}
          <div
            className="absolute inset-0 bg-[#17288a]/70"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_40_138/0.5)_0%,rgb(23_40_138/0)_45%,rgb(10_16_60/0.65)_100%)]"
            aria-hidden="true"
          />

          {/* Floating gold dots — gentle accents */}
          <span className="absolute end-[8%] top-[20%] size-3 rounded-full bg-brand-warm/80 float-y" aria-hidden="true" />
          <span className="absolute bottom-[14%] start-[10%] size-2 rounded-full bg-brand-warm/60 float-y" style={{ animationDelay: "1.2s" }} aria-hidden="true" />
          <span className="absolute end-[24%] bottom-[22%] size-2 rounded-full bg-white/40 float-y" style={{ animationDelay: "0.6s" }} aria-hidden="true" />

          <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:pt-24 lg:pb-32 lg:pt-28">
            <div className="hero-in max-w-3xl">
              <p
                className="inline-flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.18em] text-brand-warm"
                style={{ ["--i" as string]: 0 }}
              >
                <span className="inline-block size-2 rounded-full bg-brand-warm" aria-hidden="true" />
                {tagline.join(" · ")}
              </p>
              <h1
                className="mt-7 text-[2.65rem] font-extrabold leading-[1.06] sm:text-6xl lg:text-[4.1rem]"
                style={{ ["--i" as string]: 1 }}
              >
                <span className="block">{t("heroTitleA")}</span>
                <span className="block text-brand-warm">{t("heroTitleAccent")}</span>
                <span className="block">{t("heroTitleB")}</span>
              </h1>
              <p
                className="mt-7 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"
                style={{ ["--i" as string]: 2 }}
              >
                {t("heroIntro")}
              </p>
              <div
                className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                style={{ ["--i" as string]: 3 }}
              >
                <a href="#book" className="btn-primary w-full sm:w-auto">
                  {t("bookFreeConsultation")}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                </a>
                <a href="#programs" className="btn-outline-light w-full sm:w-auto">
                  {t("explorePrograms")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats band: the poster's yellow info bar */}
        <section className="bg-brand-warm-soft text-brand-deep" aria-label="NextMind in numbers">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-brand-deep/10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-brand-warm-soft px-5 py-6 sm:py-7">
                <dt dir="ltr" className="font-display text-4xl font-extrabold leading-none sm:text-5xl rtl:text-end">
                  {s.value}
                </dt>
                <dd className="mt-2 text-sm font-bold leading-snug text-brand-deep/80">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ───────── Campus ───────── */}
        <section id="campus" className="bg-background">
          <div className="section-shell">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end reveal">
              <h2 className="text-3xl font-extrabold text-ink sm:text-5xl">{t("campusTitle")}</h2>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground lg:justify-self-end">
                {t("campusIntro")}
              </p>
            </div>

            <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
              {campus.map((c, i) => (
                <li key={c.label} className={`reveal ${i % 2 === 1 ? "lg:mt-12" : ""}`} style={{ ["--rd" as string]: `${i * 80}ms` }}>
                  <figure>
                    <div className="overflow-hidden rounded-2xl bg-surface shadow-soft">
                      <img
                        src={c.src}
                        alt={c.label}
                        loading="eager"
                        decoding="async"
                        width={608}
                        height={1080}
                        className="campus-image aspect-[3/4] w-full object-cover"
                      />
                    </div>
                    <figcaption className="mt-3 flex items-center gap-2 text-sm font-bold text-ink">
                      <span className="inline-block size-2 rounded-full bg-brand-warm" aria-hidden="true" />
                      {c.label}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── Programs ───────── */}
        <section id="programs" className="section-sheet bg-surface">
          <div className="section-shell">
            <div className="section-heading reveal">
              <h2>{t("programsTitle")}</h2>
              <p>{t("programsIntro")}</p>
            </div>

            {programs.length === 0 ? (
              <p className="mt-12 text-muted-foreground">{t("emptyPrograms")}</p>
            ) : (
              <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
                {programs.map((p, i) => {
                  const loc = localizedProgram(p, lang);
                  const full = p.max_seats != null && p.seats_taken >= p.max_seats;
                  const left =
                    p.max_seats != null ? Math.max(p.max_seats - p.seats_taken, 0) : null;
                  return (
                    <article
                      key={p.id}
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
                        <h3 className="text-2xl font-extrabold leading-tight text-ink">
                          {loc.title}
                        </h3>
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
                            ) : user ? (
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
                })}
              </div>
            )}
          </div>
        </section>

        {/* ───────── How it works ───────── */}
        <section id="how" className="on-dark section-sheet relative isolate overflow-hidden bg-brand-deep text-white">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_100%_0%,rgb(26_39_201/0.45)_0%,transparent_65%),radial-gradient(40%_60%_at_10%_100%,rgb(242_199_78/0.08)_0%,transparent_70%)]"
            aria-hidden="true"
          />
          <div className="section-shell">
            <h2 className="reveal max-w-2xl text-3xl font-extrabold sm:text-5xl">{t("howTitle")}</h2>
            <ol className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
              <div
                className="absolute inset-x-0 top-6 hidden h-0.5 bg-gradient-to-r from-brand-warm/60 via-brand-warm/30 to-transparent md:block rtl:bg-gradient-to-l"
                aria-hidden="true"
              />
              {steps.map((s) => (
                <li key={s.n} className="relative reveal" style={{ ["--rd" as string]: `${Number(s.n) * 120}ms` }}>
                  <span className="relative z-10 flex size-12 items-center justify-center rounded-full border-2 border-brand-warm bg-brand-deep font-display text-xl font-extrabold text-brand-warm shadow-[0_0_26px_-8px_var(--brand-warm)]">
                    {s.n}
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">{s.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────── About ───────── */}
        <section id="about" className="section-sheet bg-background">
          <div className="section-shell grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <h2 className="reveal text-3xl font-extrabold text-ink sm:text-5xl">{t("aboutTitle")}</h2>
              <p className="mt-6 leading-relaxed text-muted-foreground">{t("aboutP1")}</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">{t("aboutP2")}</p>
              <a
                href="https://www.instagram.com/next_mindacademy"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost mt-8"
              >
                <Instagram className="size-4" aria-hidden="true" /> {t("instagramCta")}
              </a>
            </div>
            <ul className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
              {features.map(({ svg, t: title, c }, i) => (
                <li key={title} className="reveal border-t-2 border-brand-deep pt-6" style={{ ["--rd" as string]: `${i * 100}ms` }}>
                  <span
                    className={`flex size-12 items-center justify-center rounded-full ${
                      i % 2 === 0 ? "bg-brand-warm text-brand-deep" : "bg-primary text-white"
                    }`}
                  >
                    {svg}
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-ink">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── Location ───────── */}
        <section id="location" className="section-sheet bg-surface">
          <div className="section-shell">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <h2 className="reveal mt-6 text-3xl font-extrabold text-ink sm:text-5xl">
                  {t("locationTitle")}
                </h2>
                <p className="mt-5 leading-relaxed text-muted-foreground">{t("locationP")}</p>
                <p className="mt-4 text-sm text-muted-foreground" dir="ltr">
                  <span dir={lang === "ar" ? "rtl" : "ltr"}>{t("coordinates")}</span>{" "}
                  {SCHOOL_COORDS.lat.toFixed(6)}, {SCHOOL_COORDS.lng.toFixed(6)}
                </p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-8"
                >
                  {t("getDirections")} <Compass className="size-4" aria-hidden="true" />
                </a>
              </div>
              <div className="reveal overflow-hidden rounded-[1.75rem] border-[5px] border-brand-deep bg-card shadow-[10px_10px_0_var(--brand-warm)] transition-transform duration-300 hover:-translate-y-1">
                <iframe
                  src={mapEmbedUrl}
                  title="Map showing the location of NextMind Academy"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[360px] w-full border-0 sm:h-[440px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Booking ───────── */}
        <section id="book" className="on-dark section-sheet relative isolate overflow-hidden bg-brand-deep text-white">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(55%_70%_at_0%_100%,rgb(26_39_201/0.5)_0%,transparent_65%),radial-gradient(45%_60%_at_100%_0%,rgb(242_199_78/0.08)_0%,transparent_70%)]"
            aria-hidden="true"
          />
          <div className="section-shell">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div className="lg:pt-4">
                <h2 className="reveal text-3xl font-extrabold sm:text-5xl">{t("bookingTitle")}</h2>
                <p className="mt-6 leading-relaxed text-white/80">{t("bookingP")}</p>
                <p className="mt-6 text-sm text-white/70">
                  {t("preferChat")}{" "}
                  <a
                    href="https://www.instagram.com/next_mindacademy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-brand-warm underline underline-offset-4"
                  >
                    Instagram
                  </a>
                  .
                </p>
              </div>
              <div className="reveal" style={{ ["--rd" as string]: "120ms" }}>
                <ConsultationForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ───────── Footer ───────── */}
      <footer className="on-dark section-sheet bg-brand-night text-white">
        <div className="mx-auto max-w-6xl px-5 pb-28 pt-16 sm:pb-12">
          <div className="grid gap-12 sm:grid-cols-[1.3fr_0.85fr_0.85fr] reveal">
            <div>
              <img
                src={brandLogoLightUrl}
                alt="NextMind Academy"
                width={900}
                height={288}
                className="h-14 w-auto"
              />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
                {t("footerTagline")}
              </p>
              <a
                href="https://www.instagram.com/next_mindacademy"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-warm hover:underline"
              >
                <Instagram className="size-4" aria-hidden="true" /> next_mindacademy
              </a>
            </div>
            <div>
              <p className="font-display text-base font-extrabold">{t("footerNav")}</p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                {navLinks
                  .filter((l) => l.href !== "#about")
                  .map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className="transition-colors hover:text-brand-warm">
                        {l.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <p className="font-display text-base font-extrabold">{t("footerConnect")}</p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>
                  <a href="#book" className="transition-colors hover:text-brand-warm">
                    {t("bookConsultation")}
                  </a>
                </li>
                <li>
                  {user ? (
                    <Link to="/dashboard" className="transition-colors hover:text-brand-warm">
                      {t("mySpace")}
                    </Link>
                  ) : (
                    <Link to="/auth" className="transition-colors hover:text-brand-warm">
                      {t("studentLogin")}
                    </Link>
                  )}
                </li>
                <li>
                  <Link to="/admin" className="transition-colors hover:text-brand-warm">
                    {t("staffLogin")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} NextMind Academy. {t("footerRights")}
            </p>
            <p>Annaba, Algeria</p>
          </div>
        </div>
      </footer>

      {/* Floating booking CTA, phones only */}
      <div
        className={`fixed inset-x-4 bottom-4 z-40 transition-all duration-300 sm:hidden ${
          bookingVisible || !pastHero ? "pointer-events-none translate-y-6 opacity-0" : "opacity-100"
        }`}
      >
        <a href="#book" className="btn-primary w-full !shadow-[0_14px_30px_-10px_rgb(0_11_53/0.7)]">
          {t("bookFreeConsultation")}
          <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
