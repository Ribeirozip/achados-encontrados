import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminRequest = {
  id: string;
  request_code: string;
  status: string;
  created_at: string;
  full_name: string;
  cpf: string;
  phone: string;
  email: string;
  institutional_id: string;
  date_lost: string | null;
  location_lost: string | null;
  ownership_description: string;
  proof_url: string | null;
  admin_note: string | null;
  reviewed_at: string | null;
  item: {
    id: string;
    code: string;
    name: string;
    location: string;
    date_found: string;
    status: string;
    is_sensitive: boolean;
    image_url: string | null;
    tags: string[];
    category: string[];
  } | null;
};

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Não foi possível verificar o acesso.");
  if (!data) throw new Error("Acesso restrito à equipe do Achados & Perdidos.");
}

export const checkAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

/** Bootstrap: o primeiro usuário cadastrado vira administrador. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) throw new Error("Não foi possível verificar os administradores.");
    if ((count ?? 0) > 0) return { granted: false };

    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insertError) throw new Error("Não foi possível conceder o acesso.");
    return { granted: true };
  });

export const listRecoveryRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminRequest[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("recovery_requests")
      .select(
        "id, request_code, status, created_at, full_name, cpf, phone, email, institutional_id, date_lost, location_lost, ownership_description, proof_url, admin_note, reviewed_at, item:found_items(id, code, name, location, date_found, status, is_sensitive, image_url, tags, category)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AdminRequest[];
  });

export const getAdminFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { bucket: "item-photos" | "proofs"; path: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed } = await supabaseAdmin.storage
      .from(data.bucket)
      .createSignedUrl(data.path, 60 * 60);
    return { url: signed?.signedUrl ?? null };
  });

export const updateRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      action: "under_review" | "approve" | "reject" | "complete";
      note?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabase } = context;

    const { data: request, error: loadError } = await supabase
      .from("recovery_requests")
      .select("id, found_item_id, status")
      .eq("id", data.id)
      .maybeSingle();
    if (loadError || !request) throw new Error("Solicitação não encontrada.");

    const statusMap = {
      under_review: "under_review",
      approve: "approved",
      reject: "rejected",
      complete: "completed",
    } as const;

    const nextStatus = statusMap[data.action];
    const patch: Record<string, unknown> = {
      status: nextStatus,
      reviewed_at: new Date().toISOString(),
    };
    if (typeof data.note === "string") patch['admin_note'] = data.note;

    const { error: updateError } = await supabase
      .from("recovery_requests")
      .update(patch)
      .eq("id", data.id);
    if (updateError) throw new Error(updateError.message);

    if (data.action === "approve") {
      await supabase
        .from("found_items")
        .update({ status: "reserved" })
        .eq("id", request.found_item_id);
      await supabase
        .from("recovery_requests")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("found_item_id", request.found_item_id)
        .neq("id", data.id)
        .in("status", ["pending", "under_review"]);
    }

    if (data.action === "complete") {
      await supabase
        .from("found_items")
        .update({ status: "delivered" })
        .eq("id", request.found_item_id);
    }

    return { status: nextStatus };
  });
