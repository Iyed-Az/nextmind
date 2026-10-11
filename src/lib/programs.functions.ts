import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAdminSession, isUnlocked, passcodeMatches, requireUnlocked } from "./admin-session.server";
import {
  fetchPublicPrograms,
  fetchAllPrograms,
  upsertProgram,
  removeProgram,
  fetchStudents,
  fetchEnrollments,
  setEnrollmentStatus,
  fetchDashboard,
} from "./programs.server";

const programInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(80),
  ages: z.string().trim().max(80).default(""),
  description: z.string().trim().max(600).default(""),
  points: z.array(z.string().trim().max(120)).max(8).default([]),
  title_ar: z.string().trim().max(120).default(""),
  description_ar: z.string().trim().max(600).default(""),
  points_ar: z.array(z.string().trim().max(160)).max(8).default([]),
  image_url: z.string().trim().max(500).nullable().default(null),
  price: z.number().min(0).max(10_000_000).nullable().default(null),
  price_period: z.enum(["", "week", "month", "year", "session"]).default(""),
  currency: z.string().trim().min(1).max(8).default("DZD"),
  duration: z.string().trim().max(80).default(""),
  schedule: z.string().trim().max(120).default(""),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  max_seats: z.number().int().min(1).max(10_000).nullable().default(null),
  sort_order: z.number().int().min(0).max(999).default(0),
  is_published: z.boolean().default(true),
});

export const profileInput = z.object({
  full_name: z.string().trim().min(2, "Please enter a full name").max(100),
  phone: z.string().trim().max(30).default(""),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  guardian_name: z.string().trim().max(100).default(""),
  city: z.string().trim().max(80).default(""),
  notes: z.string().trim().max(500).default(""),
});
export type ProfileInput = z.infer<typeof profileInput>;

/* ---------- Public ---------- */

export const listPrograms = createServerFn({ method: "GET" }).handler(async () => {
  return fetchPublicPrograms();
});

/* ---------- Admin (passcode session) ---------- */

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { unlocked: await isUnlocked() };
});

export const unlockAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { passcode: string }) =>
    z.object({ passcode: z.string().min(1).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    if (!passcodeMatches(data.passcode)) return { ok: false as const };
    const session = await getAdminSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const adminListPrograms = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  return fetchAllPrograms();
});

export const saveProgram = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => programInput.parse(data))
  .handler(async ({ data }) => {
    await requireUnlocked();
    return upsertProgram(data);
  });
export const uploadProgramImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ base64: z.string().min(1).max(4_000_000) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bin = atob(data.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const path = `${crypto.randomUUID()}.jpg`;
    const { error } = await supabaseAdmin.storage
      .from("program-images")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("program-images").getPublicUrl(path);
    return { url: pub.publicUrl };
  });

export const deleteProgram = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    await requireUnlocked();
    await removeProgram(data.id);
    return { ok: true as const };
  });

export const adminListStudents = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  return fetchStudents();
});

export const adminListEnrollments = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  return fetchEnrollments();
});

export const adminSetEnrollmentStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "approved", "declined"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireUnlocked();
    await setEnrollmentStatus(data.id, data.status);
    return { ok: true as const };
  });

export const adminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  return fetchDashboard();
});

/* ---------- Student (signed-in user) ---------- */

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileInput.parse(data))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | undefined)?.email ?? "";
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, email, ...data }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const getMyEnrollments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const requestEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ program_id: z.string().uuid(), message: z.string().trim().max(300).default("") }).parse(data),
  )
  .handler(async ({ data, context }) => {
    // Refuse when the formation is hidden or full.
    const programs = await fetchPublicPrograms();
    const program = programs.find((p) => p.id === data.program_id);
    if (!program) return { ok: false as const, reason: "This formation is not open for enrollment." };
    if (program.max_seats != null && program.seats_taken >= program.max_seats) {
      return { ok: false as const, reason: "This formation is full." };
    }
    const { error } = await context.supabase
      .from("enrollments")
      .insert({ user_id: context.userId, program_id: data.program_id, message: data.message });
    if (error) {
      if (error.code === "23505") return { ok: false as const, reason: "You already requested this formation." };
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const cancelEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("enrollments")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
