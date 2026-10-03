import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { saveMyProfile } from "@/lib/programs.functions";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, LanguageToggle } from "@/lib/language";
import brandLogoUrl from "@/assets/nextmind-logo-brand.png";
import brandLogoLightUrl from "@/assets/nextmind-logo-brand-light.png";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "دخول الطالب — أكاديمية نكست مايند" },
      {
        name: "description",
        content: "سجّل الدخول أو أنشئ حسابك الطلابي في أكاديمية نكست مايند للالتحاق بالدورات.",
      },
      { property: "og:title", content: "دخول الطالب — أكاديمية نكست مايند" },
      { property: "og:description", content: "أنشئ حسابك الطلابي والتحق بالدورات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputClass = "field-control text-sm";

function safeRedirect(r: string | undefined) {
  return r && r.startsWith("/") && !r.startsWith("//") ? r : "/dashboard";
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [view, setView] = useState<"form" | "forgot">("form");
  const [recovery, setRecovery] = useState(false);
  const target = safeRedirect(search.redirect);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && user && !recovery) navigate({ to: target, replace: true });
  }, [loading, user, navigate, target, recovery]);

  return (
    <div className="min-h-screen bg-hero lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="on-dark relative hidden flex-col justify-between overflow-hidden bg-brand-deep p-14 text-white lg:flex">
        <div
          className="absolute inset-0 bg-[radial-gradient(60%_70%_at_80%_20%,rgb(26_39_201/0.5)_0%,transparent_65%)]"
          aria-hidden="true"
        />
        <img
          src={brandLogoLightUrl}
          alt="NextMind Academy"
          className="relative h-12 w-auto object-contain"
        />
        <div className="relative">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">
            {t("footerTagline")}
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
            {t("heroIntro")}
          </p>
        </div>
        <p className="relative text-xs font-bold uppercase tracking-widest text-brand-warm">
          Annaba, Algeria
        </p>
      </aside>

      <div className="flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-5">
          <Link to="/" className="flex items-center lg:hidden">
            <img
              src={brandLogoUrl}
              alt="NextMind Academy"
              className="h-9 max-w-[165px] w-auto object-contain sm:h-12 sm:max-w-none"
            />
          </Link>
          <span className="hidden text-sm font-bold text-muted-foreground lg:inline">
            {t("studentArea")}
          </span>
          <LanguageToggle />
        </div>
        <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-16 pt-4 sm:px-5 sm:pb-20 sm:pt-8">
        <div className="inset-panel relative overflow-hidden p-5 sm:p-9">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-accent" />

          {recovery ? (
            <>
              <p className="eyebrow">{t("studentArea")}</p>
              <h1 className="mt-3 text-2xl font-bold text-ink">{t("setNewPasswordTitle")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("setNewPasswordSub")}</p>
              <SetNewPassword
                onDone={() => {
                  setRecovery(false);
                  navigate({ to: target, replace: true });
                }}
              />
            </>
          ) : view === "forgot" ? (
            <>
              <p className="eyebrow">{t("studentArea")}</p>
              <h1 className="mt-3 text-2xl font-bold text-ink">{t("resetPasswordTitle")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("resetPasswordSub")}</p>
              <ForgotPassword onBack={() => setView("form")} />
            </>
          ) : (
            <>
              <p className="eyebrow">{t("studentArea")}</p>
              <h1 className="mt-3 text-2xl font-bold text-ink">
                {mode === "signin" ? t("welcomeBack") : t("createYourAccount")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin" ? t("signinSub") : t("signupSub")}
              </p>
              <div className="mt-5 flex items-center rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                {t("studentArea")}
              </div>

              <div
                className="mt-6 grid grid-cols-2 rounded-xl bg-surface p-1 text-sm font-semibold"
                role="tablist"
              >
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={`min-h-10 rounded-lg px-3 py-2 transition-colors ${
                      mode === m
                        ? "bg-brand-warm text-brand-warm-foreground shadow-soft"
                        : "text-muted-foreground"
                    }`}
                  >
                    {m === "signin" ? t("signIn") : t("signUp")}
                  </button>
                ))}
              </div>

              {mode === "signin" ? (
                <SignIn
                  onDone={() => navigate({ to: target, replace: true })}
                  onForgot={() => setView("forgot")}
                />
              ) : (
                <SignUp onDone={() => navigate({ to: target, replace: true })} />
              )}
            </>
          )}
        </div>
        {!recovery && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("staffQuestion")}{" "}
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              {t("staffLogin")}
              <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </p>
        )}
        </div>
      </div>
    </div>
  );
}

function SignIn({ onDone, onForgot }: { onDone: () => void; onForgot: () => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("invalid") ? t("invalidCreds") : error.message,
      );
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field label={t("email")}>
        <input
          type="email"
          required
          maxLength={255}
          autoComplete="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="ltr"
        />
      </Field>
      <Field label={t("password")}>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className={`${inputClass} pe-12`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute end-1 top-1 flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgot}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {t("forgotPassword")}
        </button>
      </div>
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
        {busy ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const redirectTo = typeof window !== "undefined" ? window.location.origin + "/auth" : undefined;
    await supabase.auth.resetPasswordForEmail(
      email.trim(),
      redirectTo ? { redirectTo } : undefined,
    );
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 space-y-5">
        <p className="rounded-lg bg-primary/10 p-4 text-sm leading-relaxed text-primary">
          {t("resetLinkSent")}
        </p>
        <button type="button" onClick={onBack} className="btn-ghost w-full justify-center">
          {t("backToSignIn")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field label={t("email")}>
        <input
          type="email"
          required
          maxLength={255}
          autoComplete="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir="ltr"
        />
      </Field>
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
        {busy ? t("sendingResetLink") : t("sendResetLink")}
      </button>
      <button type="button" onClick={onBack} className="btn-ghost w-full justify-center">
        {t("backToSignIn")}
      </button>
    </form>
  );
}

function SetNewPassword({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(t("passwordUpdateFailed"));
      return;
    }
    toast.success(t("passwordUpdated"));
    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field label={t("newPassword")}>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            className={`${inputClass} pe-12`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute end-1 top-1 flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
        {busy ? t("updatingPassword") : t("updatePassword")}
      </button>
    </form>
  );
}

const signupSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(30),
  birth_date: z.string(),
  guardian_name: z.string().trim().max(100),
  city: z.string().trim().max(80),
});

function SignUp({ onDone }: { onDone: () => void }) {
  const saveProfile = useServerFn(saveMyProfile);
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    birth_date: "",
    guardian_name: "",
    city: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.full_name },
      },
    });
    if (error) {
      setBusy(false);
      toast.error(
        error.message.toLowerCase().includes("already") ? t("accountExists") : error.message,
      );
      return;
    }
    if (!data.session) {
      setBusy(false);
      toast.success("Account created. Please check your email to confirm, then sign in.");
      return;
    }
    try {
      await saveProfile({
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          birth_date: parsed.data.birth_date || null,
          guardian_name: parsed.data.guardian_name,
          city: parsed.data.city,
          notes: "",
        },
      });
    } catch {
      toast.error(t("profileSaveFailed"));
    }
    setBusy(false);
    toast.success(t("welcomeToast"));
    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field label={t("studentFullName")}>
        <input
          required
          maxLength={100}
          className={inputClass}
          value={form.full_name}
          onChange={set("full_name")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("email")}>
          <input
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            className={inputClass}
            value={form.email}
            onChange={set("email")}
            dir="ltr"
          />
        </Field>
        <Field label={t("password")}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              className={`${inputClass} pe-12`}
              value={form.password}
              onChange={set("password")}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-1 top-1 flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("phone")}>
          <input
            type="tel"
            maxLength={30}
            className={inputClass}
            placeholder="+213 …"
            value={form.phone}
            onChange={set("phone")}
            dir="ltr"
          />
        </Field>
        <Field label={t("birthDate")}>
          <input
            type="date"
            className={inputClass}
            value={form.birth_date}
            onChange={set("birth_date")}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("guardianIfMinor")}>
          <input
            maxLength={100}
            className={inputClass}
            value={form.guardian_name}
            onChange={set("guardian_name")}
          />
        </Field>
        <Field label={t("city")}>
          <input maxLength={80} className={inputClass} value={form.city} onChange={set("city")} />
        </Field>
      </div>
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
        {busy ? t("creatingAccount") : t("createAccountBtn")}
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
