import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];

export type PublicProgram = Program & { seats_taken: number };

export type ProgramInput = {
  id?: string | undefined;
  title: string;
  ages: string;
  description: string;
  points: string[];
  title_ar: string;
  description_ar: string;
  points_ar: string[];
  image_url: string | null;
  price: number | null;
  price_period: string;
  currency: string;
  duration: string;
  schedule: string;
  start_date: string | null;
  max_seats: number | null;
  sort_order: number;
  is_published: boolean;
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Approved seats per program (service role: enrollment rows are private). */
async function approvedCounts(): Promise<Record<string, number>> {
  const db = await admin();
  const { data } = await db.from("enrollments").select("program_id").eq("status", "approved");
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.program_id] = (counts[row.program_id] ?? 0) + 1;
  return counts;
}

export async function fetchPublicPrograms(): Promise<PublicProgram[]> {
  const { data, error } = await publicClient()
    .from("programs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("fetchPublicPrograms failed", error.message);
    return [];
  }
  const counts = await approvedCounts().catch(() => ({}) as Record<string, number>);
  return (data ?? []).map((p) => ({ ...p, seats_taken: counts[p.id] ?? 0 }));
}

export async function fetchAllPrograms(): Promise<PublicProgram[]> {
  const db = await admin();
  const { data, error } = await db.from("programs").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  const counts = await approvedCounts();
  return (data ?? []).map((p) => ({ ...p, seats_taken: counts[p.id] ?? 0 }));
}

export async function upsertProgram(input: ProgramInput): Promise<Program> {
  const db = await admin();
  const row = {
    title: input.title,
    ages: input.ages,
    description: input.description,
    points: input.points.filter((p) => p.length > 0),
    title_ar: input.title_ar,
    description_ar: input.description_ar,
    points_ar: input.points_ar.filter((p) => p.length > 0),
    image_url: input.image_url,
    price: input.price,
    price_period: input.price_period,
    currency: input.currency,
    duration: input.duration,
    schedule: input.schedule,
    start_date: input.start_date,
    max_seats: input.max_seats,
    sort_order: input.sort_order,
    is_published: input.is_published,
  };

  if (input.id) {
    const { data, error } = await db.from("programs").update(row).eq("id", input.id).select("*").single();
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await db.from("programs").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function removeProgram(id: string): Promise<void> {
  const db = await admin();
  const { error } = await db.from("programs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------- Students & enrollments (admin) ---------- */

export type StudentSummary = Profile & {
  enrollments: (Pick<Enrollment, "id" | "status" | "created_at" | "program_id"> & {
    program_title: string;
  })[];
};

export async function fetchStudents(): Promise<StudentSummary[]> {
  const db = await admin();
  const [{ data: profiles, error }, { data: enrollments }, { data: programs }] = await Promise.all([
    db.from("profiles").select("*").order("created_at", { ascending: false }),
    db.from("enrollments").select("id,user_id,program_id,status,created_at"),
    db.from("programs").select("id,title"),
  ]);
  if (error) throw new Error(error.message);
  const titles = new Map((programs ?? []).map((p) => [p.id, p.title]));
  return (profiles ?? []).map((p) => ({
    ...p,
    enrollments: (enrollments ?? [])
      .filter((e) => e.user_id === p.id)
      .map((e) => ({
        id: e.id,
        status: e.status,
        created_at: e.created_at,
        program_id: e.program_id,
        program_title: titles.get(e.program_id) ?? "Removed formation",
      })),
  }));
}

export type EnrollmentRow = Enrollment & {
  student_name: string;
  student_email: string;
  student_phone: string;
  program_title: string;
};

export async function fetchEnrollments(): Promise<EnrollmentRow[]> {
  const db = await admin();
  const [{ data: enrollments, error }, { data: profiles }, { data: programs }] = await Promise.all([
    db.from("enrollments").select("*").order("created_at", { ascending: false }),
    db.from("profiles").select("id,full_name,email,phone"),
    db.from("programs").select("id,title"),
  ]);
  if (error) throw new Error(error.message);
  const byUser = new Map((profiles ?? []).map((p) => [p.id, p]));
  const titles = new Map((programs ?? []).map((p) => [p.id, p.title]));
  return (enrollments ?? []).map((e) => {
    const s = byUser.get(e.user_id);
    return {
      ...e,
      student_name: s?.full_name || "Unknown student",
      student_email: s?.email ?? "",
      student_phone: s?.phone ?? "",
      program_title: titles.get(e.program_id) ?? "Removed formation",
    };
  });
}

export async function setEnrollmentStatus(id: string, status: EnrollmentStatus): Promise<void> {
  const db = await admin();
  const { error } = await db.from("enrollments").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export type DashboardStats = {
  students: number;
  programs: number;
  pending: number;
  approved: number;
  newStudentsThisMonth: number;
  perProgram: { title: string; approved: number; pending: number; max_seats: number | null }[];
  recent: { id: string; student_name: string; program_title: string; status: EnrollmentStatus; created_at: string }[];
};

export async function fetchDashboard(): Promise<DashboardStats> {
  const db = await admin();
  const [{ data: profiles }, { data: programs }, { data: enrollments }] = await Promise.all([
    db.from("profiles").select("id,full_name,created_at"),
    db.from("programs").select("id,title,max_seats,is_published").order("sort_order"),
    db.from("enrollments").select("id,user_id,program_id,status,created_at").order("created_at", { ascending: false }),
  ]);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const titles = new Map((programs ?? []).map((p) => [p.id, p.title]));
  const all = enrollments ?? [];
  return {
    students: profiles?.length ?? 0,
    programs: (programs ?? []).filter((p) => p.is_published).length,
    pending: all.filter((e) => e.status === "pending").length,
    approved: all.filter((e) => e.status === "approved").length,
    newStudentsThisMonth: (profiles ?? []).filter((p) => new Date(p.created_at) >= monthStart).length,
    perProgram: (programs ?? []).map((p) => ({
      title: p.title,
      max_seats: p.max_seats,
      approved: all.filter((e) => e.program_id === p.id && e.status === "approved").length,
      pending: all.filter((e) => e.program_id === p.id && e.status === "pending").length,
    })),
    recent: all.slice(0, 8).map((e) => ({
      id: e.id,
      student_name: names.get(e.user_id) || "Unknown student",
      program_title: titles.get(e.program_id) ?? "Removed formation",
      status: e.status,
      created_at: e.created_at,
    })),
  };
}
