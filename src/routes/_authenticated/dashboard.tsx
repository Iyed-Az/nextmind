import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import {
  cancelEnrollment,
  getMyEnrollments,
  getMyProfile,
  listPrograms,
  requestEnrollment,
  saveMyProfile,
  type ProfileInput,
} from "@/lib/programs.functions";
import type { PublicProgram } from "@/lib/programs.server";
import { formatDate, formatPrice } from "@/lib/format";
import { useLanguage, LanguageToggle, localizedProgram } from "@/lib/language";
import brandLogoUrl from "@/assets/nextmind-logo-brand.png";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "فضائي — أكاديمية نكست مايند" },
      { name: "description", content: "ملفك الشخصي ودوراتك في أكاديمية نكست مايند." },
      { property: "og:title", content: "فضائي — أكاديمية نكست مايند" },
      { property: "og:description", content: "ملفك الشخصي ودوراتك في أكاديمية نكست مايند." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});



const inputClass =
  "field-control text-sm";

const statusCls = {
  pending: "bg-brand-warm-soft text-brand-warm-foreground",
  approved: "bg-primary/10 text-primary",
  declined: "bg-destructive/10 text-destructive",
} as const;

function Dashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchEnrollments = useServerFn(getMyEnrollments);
  const fetchPrograms = useServerFn(listPrograms);

  const profileQ = useQuery({ queryKey: ["me", "profile"], queryFn: () => fetchProfile() });
  const enrollQ = useQuery({ queryKey: ["me", "enrollments"], queryFn: () => fetchEnrollments() });
  const programsQ = useQuery({ queryKey: ["programs"], queryFn: () => fetchPrograms() });

  const [tab, setTab] = useState<"courses" | "browse" | "profile">("courses");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const firstName = profileQ.data?.full_name?.split(" ")[0] || user.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-5">
          <Link to="/" className="flex items-center">
            <img src={brandLogoUrl} alt="NextMind Academy" className="h-9 max-w-[145px] w-auto object-contain sm:h-10 sm:max-w-none" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle className="hidden sm:inline-flex" />
            <span className="hidden text-sm text-muted-foreground sm:inline" dir="ltr">{user.email}</span>
            <button className="btn-ghost !px-4 !py-2 !text-sm" onClick={signOut}>
              {t("signOut")}
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
        <div className="on-dark relative overflow-hidden rounded-[1.75rem] bg-brand-deep px-5 py-8 shadow-lift sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_90%_10%,rgb(26_39_201/0.4)_0%,transparent_60%)]" aria-hidden="true" />
          <p className="relative text-xs font-bold uppercase tracking-widest text-brand-warm">{t("mySpace")}</p>
          <h1 className="relative mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            {t("hello")} {firstName}
          </h1>
          <p className="relative mt-3 max-w-xl text-white/75">{t("dashIntro")}</p>
        </div>

        <div className="-mx-4 mt-7 flex gap-2 overflow-x-auto border-b border-border px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0" role="tablist">
          {(
            [
              ["courses", t("tabMyCourses")],
              ["browse", t("tabBrowse")],
              ["profile", t("tabProfile")],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
               className={`min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === k ? "bg-brand-warm text-brand-warm-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {profileQ.isSuccess && !profileQ.data && tab !== "profile" && (
          <div className="card-soft mt-6 flex flex-wrap items-center justify-between gap-3 border-primary/30 p-5">
            <p className="text-sm text-foreground">{t("completeProfileHint")}</p>
            <button className="btn-primary !px-4 !py-2 !text-sm" onClick={() => setTab("profile")}>
              {t("completeProfile")}
            </button>
          </div>
        )}

        <div className="mt-8">
          {tab === "courses" && (
            <MyCourses
              enrollments={enrollQ.data ?? []}
              programs={programsQ.data ?? []}
              loading={enrollQ.isLoading || programsQ.isLoading}
              onBrowse={() => setTab("browse")}
            />
          )}
          {tab === "browse" && (
            <Browse
              programs={programsQ.data ?? []}
              enrolledIds={new Set((enrollQ.data ?? []).map((e) => e.program_id))}
              loading={programsQ.isLoading}
              hasProfile={!!profileQ.data}
              onNeedProfile={() => setTab("profile")}
            />
          )}
          {tab === "profile" && (
            <ProfileForm initial={profileQ.data ?? null} email={user.email ?? ""} loading={profileQ.isLoading} />
          )}
        </div>
      </main>
    </div>
  );
}

type EnrollmentItem = Awaited<ReturnType<typeof getMyEnrollments>>[number];

function MyCourses({
  enrollments,
  programs,
  loading,
  onBrowse,
}: {
  enrollments: EnrollmentItem[];
  programs: PublicProgram[];
  loading: boolean;
  onBrowse: () => void;
}) {
  const queryClient = useQueryClient();
  const { t, lang } = useLanguage();
  const cancel = useServerFn(cancelEnrollment);
  const cancelM = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: () => {
      toast.success(t("requestCancelled"));
      queryClient.invalidateQueries({ queryKey: ["me", "enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: () => toast.error(t("cancelFailed")),
  });

  const statusText = {
    pending: t("statusPending"),
    approved: t("statusApproved"),
    declined: t("statusDeclined"),
  } as const;

  if (loading) return <div className="grid gap-5 md:grid-cols-2"><div className="loading-block" /><div className="loading-block" /></div>;
  if (enrollments.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="text-lg font-semibold text-ink">{t("noFormations")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("noFormationsP")}</p>
        <button className="btn-primary mt-6" onClick={onBrowse}>
          {t("browseFormations")}
        </button>
      </div>
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {enrollments.map((e) => {
        const p = programs.find((x) => x.id === e.program_id);
        const loc = p ? localizedProgram(p, lang) : null;
        return (
          <article key={e.id} className="card-soft card-interactive overflow-hidden border-t-4 border-t-brand-warm p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {p?.ages ?? t("formationLabel")}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-ink">{loc?.title ?? t("formationLabel")}</h3>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusCls[e.status]}`}>
                {statusText[e.status]}
              </span>
            </div>
            {p && (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {p.duration && <Meta k={t("duration")} v={p.duration} />}
                {p.schedule && <Meta k={t("schedule")} v={p.schedule} />}
                {p.start_date && <Meta k={t("starts")} v={formatDate(p.start_date, lang) ?? ""} />}
                <Meta k={t("price")} v={formatPrice(p.price, p.currency, lang)} />
              </dl>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              {t("requestedOn")} {new Date(e.created_at).toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB")}
            </p>
            {e.status === "pending" && (
              <button
                className="btn-ghost mt-4 !px-4 !py-2 !text-sm"
                disabled={cancelM.isPending}
                onClick={() => cancelM.mutate(e.id)}
              >
                {t("cancelRequest")}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground">{v}</dd>
    </div>
  );
}

function Browse({
  programs,
  enrolledIds,
  loading,
  hasProfile,
  onNeedProfile,
}: {
  programs: PublicProgram[];
  enrolledIds: Set<string>;
  loading: boolean;
  hasProfile: boolean;
  onNeedProfile: () => void;
}) {
  const queryClient = useQueryClient();
  const { t, lang } = useLanguage();
  const request = useServerFn(requestEnrollment);
  const [message, setMessage] = useState<Record<string, string>>({});
  const m = useMutation({
    mutationFn: (program_id: string) => request({ data: { program_id, message: message[program_id] ?? "" } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.reason);
        return;
      }
      toast.success(t("requestSent"));
      queryClient.invalidateQueries({ queryKey: ["me", "enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: () => toast.error(t("requestFailed")),
  });

  if (loading) return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><div className="loading-block" /><div className="loading-block" /><div className="loading-block" /></div>;
  if (programs.length === 0) return <div className="empty-state"><p className="text-muted-foreground">{t("noneOpen")}</p></div>;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {programs.map((p) => {
        const full = p.max_seats != null && p.seats_taken >= p.max_seats;
        const already = enrolledIds.has(p.id);
        const loc = localizedProgram(p, lang);
        const maxSeats = p.max_seats;
        const seatsValue = maxSeats == null
          ? ""
          : lang === "ar"
            ? `${Math.max(maxSeats - p.seats_taken, 0)} ${t("ofSeatsLeft")} ${maxSeats}`
            : `${Math.max(maxSeats - p.seats_taken, 0)} ${t("ofSeatsLeft")} ${maxSeats} ${t("seatsLeftSuffix")}`.trim();
        return (
          <article key={p.id} className="card-soft card-interactive flex flex-col overflow-hidden border-t-4 border-t-brand-warm p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{p.ages}</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{loc.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{loc.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {p.duration && <Meta k={t("duration")} v={p.duration} />}
              {p.schedule && <Meta k={t("schedule")} v={p.schedule} />}
              {p.start_date && <Meta k={t("starts")} v={formatDate(p.start_date, lang) ?? ""} />}
              <Meta k={t("price")} v={formatPrice(p.price, p.currency, lang)} />
              {p.max_seats != null && <Meta k={t("seats")} v={seatsValue} />}
            </dl>
            <div className="mt-auto pt-5">
              {already ? (
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {t("alreadyRequested")}
                </span>
              ) : full ? (
                <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {t("fullLabel")}
                </span>
              ) : (
                <div className="space-y-2">
                  <input
                    className={inputClass}
                    placeholder={t("messageForAcademy")}
                    maxLength={300}
                    value={message[p.id] ?? ""}
                    onChange={(e) => setMessage({ ...message, [p.id]: e.target.value })}
                  />
                  <button
                    className="btn-primary w-full justify-center !py-2.5 !text-sm"
                    disabled={m.isPending}
                    onClick={() => (hasProfile ? m.mutate(p.id) : onNeedProfile())}
                  >
                    {hasProfile ? t("requestEnrollment") : t("completeToEnroll")}
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProfileForm({
  initial,
  email,
  loading,
}: {
  initial: Awaited<ReturnType<typeof getMyProfile>>;
  email: string;
  loading: boolean;
}) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const save = useServerFn(saveMyProfile);
  const [form, setForm] = useState<ProfileInput>({
    full_name: "",
    phone: "",
    birth_date: null,
    guardian_name: "",
    city: "",
    notes: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        full_name: initial.full_name,
        phone: initial.phone,
        birth_date: initial.birth_date,
        guardian_name: initial.guardian_name,
        city: initial.city,
        notes: initial.notes,
      });
    }
  }, [initial]);

  const m = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: () => {
      toast.success(t("profileSaved"));
      queryClient.invalidateQueries({ queryKey: ["me", "profile"] });
    },
    onError: () => toast.error(t("profileSaveError")),
  });

  if (loading) return <div className="loading-block max-w-2xl" />;

  return (
    <form
      className="inset-panel max-w-2xl space-y-4 overflow-hidden border-t-4 border-t-brand-warm p-5 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
    >
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <div><h2 className="text-lg font-semibold text-ink">{t("yourDetails")}</h2><p className="text-xs text-muted-foreground">{t("completeProfileHint")}</p></div>
      </div>
      <Field label={t("email")}>
        <input className={`${inputClass} opacity-70`} value={email} disabled dir="ltr" />
      </Field>
      <Field label={t("fullName")}>
        <input className={inputClass} required maxLength={100} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("phone")}>
          <input type="tel" className={inputClass} maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
        </Field>
        <Field label={t("birthDate")}>
          <input type="date" className={inputClass} value={form.birth_date ?? ""} onChange={(e) => setForm({ ...form, birth_date: e.target.value || null })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("parentGuardian")}>
          <input className={inputClass} maxLength={100} value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
        </Field>
        <Field label={t("city")}>
          <input className={inputClass} maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </Field>
      </div>
      <Field label={t("notesOptional")}>
        <textarea className={`${inputClass} min-h-24`} maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </Field>
      <button type="submit" className="btn-primary" disabled={m.isPending}>
        {m.isPending ? t("saving") : t("saveProfile")}
        {!m.isPending && <ChevronRight className="size-4 rtl:rotate-180" />}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
