import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, LockKeyhole, Search } from "lucide-react";

import {
  adminDashboard,
  adminListEnrollments,
  adminListPrograms,
  adminListStudents,
  adminSetEnrollmentStatus,
  adminStatus,
  deleteProgram,
  lockAdmin,
  saveProgram,
  unlockAdmin,
  uploadProgramImage,
} from "@/lib/programs.functions";
import type { EnrollmentStatus, PublicProgram, StudentSummary } from "@/lib/programs.server";
import { ageFromBirthDate, formatDate, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — NextMind Academy" },
      {
        name: "description",
        content: "Passcode-protected area for NextMind Academy staff to manage formations, students and enrollments.",
      },
      { property: "og:title", content: "Admin panel — NextMind Academy" },
      { property: "og:description", content: "Manage NextMind Academy formations, students and enrollments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "programs" | "students" | "enrollments";

function AdminPage() {
  const status = useServerFn(adminStatus);
  const statusQuery = useQuery({ queryKey: ["admin-status"], queryFn: () => status({}) });

  if (statusQuery.isLoading) return <Shell>Loading…</Shell>;
  return statusQuery.data?.unlocked ? <Panel /> : <Unlock />;
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-4xl"} px-4 py-8 sm:px-5 sm:py-12`}>{children}</div>
    </div>
  );
}

function Unlock() {
  const queryClient = useQueryClient();
  const unlock = useServerFn(unlockAdmin);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode.trim()) return;
    setBusy(true);
    setError(false);
    try {
      const res = await unlock({ data: { passcode } });
      if (res.ok) await queryClient.invalidateQueries({ queryKey: ["admin-status"] });
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      setPasscode("");
    }
  }

  return (
    <Shell>
      <div className="mx-auto mt-8 max-w-sm inset-panel relative overflow-hidden p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-accent" />
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-warm-soft text-brand-warm-foreground"><LockKeyhole className="size-5" /></span>
        <p className="eyebrow">Staff area</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Enter passcode</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only academy staff can manage formations, students and enrollments.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoComplete="current-password"
            maxLength={200}
            placeholder="Passcode"
            className={inputClass}
          />
          {error && <p className="text-sm text-destructive">Incorrect passcode.</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">
          Back to website
        </Link>
      </div>
    </Shell>
  );
}

function Panel() {
  const queryClient = useQueryClient();
  const lock = useServerFn(lockAdmin);
  const [tab, setTab] = useState<Tab>("dashboard");
  const dashboardFn = useServerFn(adminDashboard);
  const dash = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => dashboardFn({}) });

  const tabs: [Tab, string, number | undefined][] = [
    ["dashboard", "Dashboard", undefined],
    ["programs", "Formations", undefined],
    ["students", "Students", dash.data?.students],
    ["enrollments", "Requests", dash.data?.pending],
  ];

  return (
    <Shell wide>
        <div className="relative overflow-hidden rounded-2xl bg-brand-deep px-5 py-7 shadow-lift sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
           <p className="text-xs font-bold uppercase tracking-widest text-brand-warm">Staff area</p>
           <h1 className="mt-3 text-3xl font-bold text-primary-foreground">Admin panel</h1>
        </div>
        <div className="flex gap-2">
           <Link to="/" className="btn-ghost border-primary-foreground/20 bg-primary-foreground/10 !px-4 !py-2 !text-sm text-primary-foreground">
            View website
          </Link>
          <button
             className="btn-ghost border-primary-foreground/20 bg-primary-foreground/10 !px-4 !py-2 !text-sm text-primary-foreground"
            onClick={async () => {
              await lock({});
              await queryClient.invalidateQueries();
            }}
          >
            Lock
          </button>
        </div>
        </div>
      </div>

      <div className="-mx-4 mt-7 flex gap-2 overflow-x-auto border-b border-border px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0" role="tablist">
        {tabs.map(([k, label, count]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
               tab === k ? "bg-brand-warm text-brand-warm-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {count != null && count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                   tab === k ? "bg-brand-warm-foreground/15" : k === "enrollments" ? "bg-brand-warm text-brand-warm-foreground" : "bg-card"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "dashboard" && <DashboardTab onGo={setTab} />}
        {tab === "programs" && <ProgramsTab />}
        {tab === "students" && <StudentsTab />}
        {tab === "enrollments" && <EnrollmentsTab />}
      </div>
    </Shell>
  );
}

/* ---------------- Dashboard ---------------- */

function DashboardTab({ onGo }: { onGo: (t: Tab) => void }) {
  const fn = useServerFn(adminDashboard);
  const q = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => fn({}) });
  const d = q.data;
  if (q.isLoading || !d) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="loading-block" /><div className="loading-block" /><div className="loading-block" /><div className="loading-block" /></div>;

  const cards = [
    { label: "Students", value: d.students, sub: `${d.newStudentsThisMonth} new this month`, go: "students" as Tab },
    { label: "Formations online", value: d.programs, sub: "visible on the website", go: "programs" as Tab },
    { label: "Pending requests", value: d.pending, sub: "waiting for your answer", go: "enrollments" as Tab },
    { label: "Active enrollments", value: d.approved, sub: "approved places", go: "enrollments" as Tab },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button key={c.label} onClick={() => onGo(c.go)} className="card-soft card-interactive relative overflow-hidden p-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-4xl font-bold text-brand-warm-foreground">{c.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-soft p-6">
          <h2 className="text-lg font-semibold text-ink">Seats per formation</h2>
          <div className="mt-5 space-y-4">
            {d.perProgram.length === 0 && <p className="text-sm text-muted-foreground">No formations yet.</p>}
            {d.perProgram.map((p) => {
              const max = p.max_seats ?? Math.max(p.approved + p.pending, 1);
              const pct = Math.min(100, Math.round((p.approved / max) * 100));
              return (
                <div key={p.title}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{p.title}</span>
                    <span className="text-muted-foreground">
                      {p.approved}
                      {p.max_seats != null ? ` / ${p.max_seats}` : ""} enrolled
                      {p.pending > 0 ? ` · ${p.pending} pending` : ""}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-gradient-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card-soft p-6">
          <h2 className="text-lg font-semibold text-ink">Recent activity</h2>
          <ul className="mt-4 divide-y divide-border">
            {d.recent.length === 0 && <li className="py-3 text-sm text-muted-foreground">No requests yet.</li>}
            {d.recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{r.student_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.program_title} · {new Date(r.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <StatusPill status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: EnrollmentStatus }) {
  const map = {
    pending: "bg-brand-warm-soft text-brand-warm-foreground",
    approved: "bg-primary/10 text-primary",
    declined: "bg-destructive/10 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status]}`}>{status}</span>;
}

/* ---------------- Formations ---------------- */

type Draft = {
  id?: string;
  title: string;
  ages: string;
  description: string;
  pointsText: string;
  titleAr: string;
  descriptionAr: string;
  pointsArText: string;
  image_url: string;
  price: string;
  price_period: string;
  currency: string;
  duration: string;
  schedule: string;
  start_date: string;
  max_seats: string;
  sort_order: number;
  is_published: boolean;
};

const emptyDraft: Draft = {
  title: "",
  ages: "",
  description: "",
  pointsText: "",
  titleAr: "",
  descriptionAr: "",
  pointsArText: "",
  image_url: "",
  price: "",
  price_period: "",
  currency: "DZD",
  duration: "",
  schedule: "",
  start_date: "",
  max_seats: "",
  sort_order: 0,
  is_published: true,
};

function toDraft(p: PublicProgram): Draft {
  return {
    id: p.id,
    title: p.title,
    ages: p.ages,
    description: p.description,
    pointsText: p.points.join("\n"),
    titleAr: p.title_ar,
    descriptionAr: p.description_ar,
    pointsArText: p.points_ar.join("\n"),
    image_url: p.image_url ?? "",
    price: p.price == null ? "" : String(p.price),
    price_period: p.price_period ?? "",
    currency: p.currency,
    duration: p.duration,
    schedule: p.schedule,
    start_date: p.start_date ?? "",
    max_seats: p.max_seats == null ? "" : String(p.max_seats),
    sort_order: p.sort_order,
    is_published: p.is_published,
  };
}
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
}

function ProgramsTab() {
  const queryClient = useQueryClient();
  const list = useServerFn(adminListPrograms);
  const save = useServerFn(saveProgram);
  const remove = useServerFn(deleteProgram);
  const [draft, setDraft] = useState<Draft | null>(null);
  const upload = useServerFn(uploadProgramImage);
const [uploading, setUploading] = useState(false);

const handleImageFile = async (file?: File | null) => {
  if (!file || !file.type.startsWith("image/")) {
    toast.error("Please choose an image file");
    return;
  }
  setUploading(true);
  try {
    const base64 = await compressImage(file);
    const { url } = await upload({ data: { base64 } });
    setDraft((d) => (d ? { ...d, image_url: url } : d));
    toast.success("Image uploaded");
  } catch {
    toast.error("Could not upload the image");
  } finally {
    setUploading(false);
  }
};

  const programsQuery = useQuery({ queryKey: ["admin-programs"], queryFn: () => list({}) });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const saveMutation = useMutation({
    mutationFn: (d: Draft) =>
      save({
        data: {
          ...(d.id ? { id: d.id } : {}),
          title: d.title,
          ages: d.ages,
          description: d.description,
          points: d.pointsText.split("\n").map((p) => p.trim()).filter(Boolean),
          title_ar: d.titleAr.trim(),
          description_ar: d.descriptionAr.trim(),
          points_ar: d.pointsArText.split("\n").map((p) => p.trim()).filter(Boolean),
          image_url: d.image_url.trim() ? d.image_url.trim() : null,
          price: d.price.trim() === "" ? null : Number(d.price),
          price_period: d.price_period as "" | "week" | "month" | "year" | "session",
          currency: d.currency.trim() || "DZD",
          duration: d.duration,
          schedule: d.schedule,
          start_date: d.start_date || null,
          max_seats: d.max_seats.trim() === "" ? null : Number(d.max_seats),
          sort_order: Number(d.sort_order) || 0,
          is_published: d.is_published,
        },
      }),
    onSuccess: () => {
      toast.success("Formation saved");
      setDraft(null);
      refresh();
    },
    onError: () => toast.error("Could not save the formation — check the fields"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Formation removed");
      refresh();
    },
    onError: () => toast.error("Could not remove the formation"),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-ink">Formations</h2>
        <button className="btn-primary !px-5 !py-2.5 !text-sm" onClick={() => setDraft({ ...emptyDraft })}>
          Add formation
        </button>
      </div>

      {draft && (
        <form
          className="card-soft mt-6 space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.title.trim()) {
              toast.error("A title is required");
              return;
            }
            saveMutation.mutate(draft);
          }}
        >
          <h3 className="text-lg font-semibold text-ink">{draft.id ? "Edit formation" : "New formation"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input className={inputClass} value={draft.title} maxLength={80} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="Ages / audience">
              <input className={inputClass} value={draft.ages} maxLength={80} placeholder="Ages 8+ & adults" onChange={(e) => setDraft({ ...draft, ages: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={`${inputClass} min-h-24`} value={draft.description} maxLength={600} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </Field>
          <Field label="Highlights (one per line)">
            <textarea className={`${inputClass} min-h-24`} value={draft.pointsText} onChange={(e) => setDraft({ ...draft, pointsText: e.target.value })} />
          </Field>
          <div className="rounded-xl border border-brand-warm/40 bg-brand-warm-soft/40 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-warm-foreground">Arabic version (optional)</p>
            <Field label="Title (Arabic)">
              <input dir="rtl" className={inputClass} value={draft.titleAr} maxLength={120} onChange={(e) => setDraft({ ...draft, titleAr: e.target.value })} />
            </Field>
            <div className="mt-4">
              <Field label="Description (Arabic)">
                <textarea dir="rtl" className={`${inputClass} min-h-24`} value={draft.descriptionAr} maxLength={600} onChange={(e) => setDraft({ ...draft, descriptionAr: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Highlights in Arabic (one per line)">
                <textarea dir="rtl" className={`${inputClass} min-h-24`} value={draft.pointsArText} onChange={(e) => setDraft({ ...draft, pointsArText: e.target.value })} />
              </Field>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price">
              <input type="number" min={0} step="0.01" className={inputClass} value={draft.price} placeholder="Leave empty for 'on request'" onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
            </Field>
            <Field label="Currency">
              <input className={inputClass} value={draft.currency} maxLength={8} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
            </Field>
            <Field label="Price per">
              <select className={inputClass} value={draft.price_period} onChange={(e) => setDraft({ ...draft, price_period: e.target.value })}>
               <option value="">One-time (no period)</option>
               <option value="month">Month / شهر</option>
               <option value="week">Week / أسبوع</option>
               <option value="year">Year / سنة</option>
               <option value="session">Session / حصة</option>
             </select>
            </Field>
            <Field label="Max seats">
              <input type="number" min={1} className={inputClass} value={draft.max_seats} placeholder="Unlimited" onChange={(e) => setDraft({ ...draft, max_seats: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Duration">
              <input className={inputClass} value={draft.duration} maxLength={80} placeholder="8 weeks" onChange={(e) => setDraft({ ...draft, duration: e.target.value })} />
            </Field>
            <Field label="Schedule">
              <input className={inputClass} value={draft.schedule} maxLength={120} placeholder="Saturdays 10:00–12:00" onChange={(e) => setDraft({ ...draft, schedule: e.target.value })} />
            </Field>
            <Field label="Start date">
              <input type="date" className={inputClass} value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} />
            </Field>
          </div>
         <div
  onPaste={(e) => {
    const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith("image/"));
    if (f) {
      e.preventDefault();
      handleImageFile(f);
    }
  }}
>
  <span className="mb-1.5 block text-sm font-medium text-foreground">Image (optional)</span>
  <input className={inputClass} value={draft.image_url} maxLength={500} placeholder="Paste an image here (Ctrl+V) or a direct image link…" onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
  <div className="mt-2 flex items-center gap-3">
    <label className="btn-ghost cursor-pointer !px-4 !py-2 !text-sm">
      {uploading ? "Uploading…" : "Upload from device"}
      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { handleImageFile(e.target.files?.[0]); e.target.value = ""; }} />
    </label>
    {draft.image_url && <img src={draft.image_url} alt="" referrerPolicy="no-referrer" className="h-16 w-24 rounded-lg object-cover" />}
  </div>
</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display order">
              <input type="number" min={0} max={999} className={inputClass} value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
            </Field>
            <label className="flex items-center gap-2 self-end text-sm text-foreground">
              <input type="checkbox" checked={draft.is_published} onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })} />
              Visible on the website
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save formation"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {programsQuery.isLoading && <p className="text-muted-foreground">Loading formations…</p>}
        {programsQuery.data?.length === 0 && <p className="text-muted-foreground">No formations yet — add your first one.</p>}
        {programsQuery.data?.map((p) => (
          <div key={p.id} className="card-soft card-interactive flex flex-wrap items-start justify-between gap-4 border-s-4 border-s-brand-warm p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                #{p.sort_order} · {p.is_published ? "Visible" : "Hidden"} · {p.ages || "All ages"}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground">
                <span>{formatPrice(p.price, p.currency, "en", p.price_period)}</span>
                {p.duration && <span>{p.duration}</span>}
                {p.schedule && <span>{p.schedule}</span>}
                {p.start_date && <span>Starts {formatDate(p.start_date)}</span>}
                <span className="text-muted-foreground">
                  {p.seats_taken}
                  {p.max_seats != null ? ` / ${p.max_seats}` : ""} enrolled
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost !px-4 !py-2 !text-sm" onClick={() => setDraft(toDraft(p))}>
                Edit
              </button>
              <button
                className="btn-ghost !px-4 !py-2 !text-sm !text-destructive"
                onClick={() => {
                  if (confirm(`Remove "${p.title}"? Student enrollments for it will also be removed.`)) deleteMutation.mutate(p.id);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Students ---------------- */

function StudentsTab() {
  const fn = useServerFn(adminListStudents);
  const q = useQuery({ queryKey: ["admin-students"], queryFn: () => fn({}) });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<StudentSummary | null>(null);

  const students = (q.data ?? []).filter((s) => {
    const t = search.toLowerCase();
    return !t || s.full_name.toLowerCase().includes(t) || s.email.toLowerCase().includes(t) || s.phone.includes(t);
  });

  if (open) return <StudentProfile s={open} onBack={() => setOpen(null)} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-ink">
          Students <span className="text-muted-foreground">({q.data?.length ?? 0})</span>
        </h2>
        <div className="relative w-full max-w-xs"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className={`${inputClass} ps-10`} placeholder="Search name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>
      {q.isLoading && <p className="mt-6 text-muted-foreground">Loading students…</p>}
       {q.data?.length === 0 && <div className="empty-state mt-6"><p className="text-muted-foreground">No students registered yet.</p></div>}
       <div className="card-soft mt-6 overflow-x-auto">
        {students.length > 0 && (
           <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Age</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Formations</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s) => {
                const age = ageFromBirthDate(s.birth_date);
                const approved = s.enrollments.filter((e) => e.status === "approved");
                return (
                  <tr key={s.id} className="hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{s.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </td>
                    <td className="px-5 py-3 text-foreground">{age ?? "—"}</td>
                    <td className="px-5 py-3 text-foreground">{s.phone || "—"}</td>
                    <td className="px-5 py-3 text-foreground">
                      {approved.length === 0 ? (
                        <span className="text-muted-foreground">None yet</span>
                      ) : (
                        approved.map((e) => e.program_title).join(", ")
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString("en-GB")}</td>
                    <td className="px-5 py-3 text-right">
                      <button className="font-semibold text-primary hover:underline" onClick={() => setOpen(s)}>
                        View profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StudentProfile({ s, onBack }: { s: StudentSummary; onBack: () => void }) {
  const age = ageFromBirthDate(s.birth_date);
  const rows: [string, string][] = [
    ["Email", s.email || "—"],
    ["Phone", s.phone || "—"],
    ["Date of birth", s.birth_date ? `${formatDate(s.birth_date)} (${age} years)` : "—"],
    ["Parent / guardian", s.guardian_name || "—"],
    ["City", s.city || "—"],
    ["Registered", new Date(s.created_at).toLocaleDateString("en-GB")],
  ];
  return (
    <div>
      <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" onClick={onBack}>
        <ArrowLeft className="size-4" /> All students
      </button>
      <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card-soft p-6">
          <p className="eyebrow">Student</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{s.full_name || "Unnamed student"}</h2>
          <dl className="mt-5 space-y-3 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          {s.notes && (
            <div className="mt-5 rounded-xl bg-surface p-4 text-sm text-foreground">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notes</p>
              <p className="mt-1">{s.notes}</p>
            </div>
          )}
          {s.phone && (
            <a href={`tel:${s.phone}`} className="btn-primary mt-6 !px-5 !py-2.5 !text-sm">
              Call {s.phone}
            </a>
          )}
        </div>
        <div className="card-soft p-6">
          <h3 className="text-lg font-semibold text-ink">Formations</h3>
          {s.enrollments.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No enrollment requests yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {s.enrollments.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{e.program_title}</p>
                    <p className="text-xs text-muted-foreground">Requested {new Date(e.created_at).toLocaleDateString("en-GB")}</p>
                  </div>
                  <StatusPill status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Enrollment requests ---------------- */

function EnrollmentsTab() {
  const queryClient = useQueryClient();
  const fn = useServerFn(adminListEnrollments);
  const setStatus = useServerFn(adminSetEnrollmentStatus);
  const q = useQuery({ queryKey: ["admin-enrollments"], queryFn: () => fn({}) });
  const [filter, setFilter] = useState<EnrollmentStatus | "all">("pending");

  const m = useMutation({
    mutationFn: (v: { id: string; status: EnrollmentStatus }) => setStatus({ data: v }),
    onSuccess: (_r, v) => {
      toast.success(v.status === "approved" ? "Student enrolled" : v.status === "declined" ? "Request declined" : "Moved back to pending");
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    },
    onError: () => toast.error("Could not update the request"),
  });

  const rows = (q.data ?? []).filter((e) => filter === "all" || e.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-ink">Enrollment requests</h2>
        <div className="flex gap-1 rounded-full bg-surface p-1 text-sm">
          {(["pending", "approved", "declined", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 font-semibold capitalize ${filter === f ? "bg-card text-ink shadow-soft" : "text-muted-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {q.isLoading && <p className="mt-6 text-muted-foreground">Loading requests…</p>}
      {!q.isLoading && rows.length === 0 && <div className="empty-state mt-6"><p className="text-muted-foreground">Nothing here right now.</p></div>}
      <div className="mt-6 space-y-3">
        {rows.map((e) => (
         <div key={e.id} className="card-soft flex flex-col items-stretch justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{e.student_name}</p>
                <StatusPill status={e.status} />
              </div>
              <p className="mt-1 text-sm text-foreground">
                wants to join <span className="font-medium">{e.program_title}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.student_email}
                {e.student_phone ? ` · ${e.student_phone}` : ""} · {new Date(e.created_at).toLocaleDateString("en-GB")}
              </p>
              {e.message && <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-sm text-foreground">“{e.message}”</p>}
            </div>
             <div className="flex flex-wrap gap-2">
              {e.status !== "approved" && (
                <button className="btn-primary !px-4 !py-2 !text-sm" disabled={m.isPending} onClick={() => m.mutate({ id: e.id, status: "approved" })}>
                  Approve
                </button>
              )}
              {e.status !== "declined" && (
                <button className="btn-ghost !px-4 !py-2 !text-sm" disabled={m.isPending} onClick={() => m.mutate({ id: e.id, status: "declined" })}>
                  Decline
                </button>
              )}
              {e.status !== "pending" && (
                <button className="btn-ghost !px-4 !py-2 !text-sm" disabled={m.isPending} onClick={() => m.mutate({ id: e.id, status: "pending" })}>
                  Undo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputClass =
  "field-control text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
