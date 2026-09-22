import { createServerFn } from "@tanstack/react-start";

const MAX_BYTES = 10 * 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROOF_TYPES = [...IMAGE_TYPES, "application/pdf"];

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

type UploadInput = { contentType: string; data: string };

function parseUpload(input: unknown, allowed: string[]): UploadInput {
  const value = input as Partial<UploadInput> | null;
  if (!value || typeof value.contentType !== "string" || typeof value.data !== "string") {
    throw new Error("Arquivo inválido.");
  }
  if (!allowed.includes(value.contentType)) throw new Error("Formato de arquivo não permitido.");
  if (value.data.length > Math.ceil((MAX_BYTES * 4) / 3) + 1024) {
    throw new Error("Arquivo muito grande.");
  }
  return { contentType: value.contentType, data: value.data };
}

function decodeBase64(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  if (bytes.byteLength > MAX_BYTES) throw new Error("Arquivo muito grande.");
  return bytes;
}

async function uploadTo(bucket: string, input: UploadInput): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const bytes = decodeBase64(input.data);
  const path = `${crypto.randomUUID()}.${EXTENSION_BY_TYPE[input.contentType] ?? "bin"}`;
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, bytes, { contentType: input.contentType, upsert: false });
  if (error) throw new Error("Não foi possível enviar o arquivo.");
  return path;
}

export const uploadItemPhoto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => parseUpload(input, IMAGE_TYPES))
  .handler(async ({ data }) => ({ path: await uploadTo("item-photos", data) }));

export const uploadProof = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => parseUpload(input, PROOF_TYPES))
  .handler(async ({ data }) => ({ path: await uploadTo("proofs", data) }));

/** URL assinada apenas para fotos de itens públicos (não sensíveis). */
export const getPublicItemPhotoUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const value = input as { path?: unknown };
    if (!value || typeof value.path !== "string" || !value.path) {
      throw new Error("Caminho inválido.");
    }
    return { path: value.path };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: item } = await supabaseAdmin
      .from("found_items")
      .select("id")
      .eq("image_url", data.path)
      .eq("is_sensitive", false)
      .maybeSingle();
    if (!item) return { url: null };
    const { data: signed } = await supabaseAdmin.storage
      .from("item-photos")
      .createSignedUrl(data.path, 60 * 60);
    return { url: signed?.signedUrl ?? null };
  });
