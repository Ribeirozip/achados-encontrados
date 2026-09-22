import { supabase } from "@/integrations/supabase/client";

export const TAG_SUGGESTIONS = [
  "Óculos",
  "Preto",
  "Azul",
  "Branco",
  "Vermelho",
  "Celular",
  "iPhone",
  "Samsung",
  "Mochila",
  "Caderno",
  "Carteira",
  "Chave",
  "Garrafa",
  "Fone",
  "Relógio",
  "Documento",
  "Cartão",
  "Roupa",
  "Tênis",
  "Guarda-chuva",
];

export const CATEGORIES = [
  "Óculos",
  "Celular",
  "Mochila",
  "Carteira",
  "Chave",
  "Garrafa",
  "Fone",
  "Relógio",
  "Caderno",
  "Documento",
  "Cartão",
  "Roupa",
  "Outro",
];

export const SENSITIVE_CATEGORIES = ["Documento", "Cartão", "Carteira"];

export const LOCATIONS = [
  "Biblioteca",
  "Sala de aula",
  "Laboratório",
  "Auditório",
  "Cantina",
  "Área externa",
  "Estacionamento",
  "Banheiro",
  "Outro",
];

export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export type FoundItem = {
  id: string;
  code: string;
  name: string;
  category: string[];
  tags: string[];
  description: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  location: string;
  date_found: string;
  time_found: string | null;
  image_url: string | null;
  is_sensitive: boolean;
  status: string;
};

export type MatchResult = FoundItem & { matchPercent: number };

export function scoreItem(userTags: string[], item: FoundItem): number {
  const normalizedUserTags = Array.from(new Set(userTags.map(normalize))).filter(Boolean);
  if (normalizedUserTags.length === 0) return 0;

  const itemTags = Array.from(
    new Set([...(item.tags ?? []), ...(item.category ?? [])].map(normalize)),
  ).filter(Boolean);

  const haystack = normalize(
    [
      item.name,
      item.description ?? "",
      item.brand ?? "",
      item.model ?? "",
      item.color ?? "",
      (item.tags ?? []).join(" "),
      (item.category ?? []).join(" "),
    ].join(" "),
  );

  let matches = 0;
  for (const tag of normalizedUserTags) {
    if (itemTags.some((t) => t === tag || t.includes(tag) || tag.includes(t))) {
      matches += 1;
    } else if (haystack.includes(tag)) {
      matches += 1;
    }
  }

  const base = Math.max(normalizedUserTags.length, itemTags.length || normalizedUserTags.length);
  return Math.round((matches / base) * 100);
}

export function rankItems(userTags: string[], items: FoundItem[]): MatchResult[] {
  return items
    .map((item) => ({ ...item, matchPercent: scoreItem(userTags, item) }))
    .filter((item) => item.matchPercent >= 30)
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

export async function fetchAvailableItems(): Promise<FoundItem[]> {
  const { data, error } = await supabase
    .from("found_items")
    .select(
      "id, code, name, category, tags, description, brand, model, color, location, date_found, time_found, image_url, is_sensitive, status",
    )
    .eq("status", "available")
    .eq("is_sensitive", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as FoundItem[];
}

export async function fetchItemById(id: string): Promise<FoundItem | null> {
  const { data, error } = await supabase
    .from("found_items")
    .select(
      "id, code, name, category, tags, description, brand, model, color, location, date_found, time_found, image_url, is_sensitive, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as FoundItem | null) ?? null;
}

export async function getPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { getPublicItemPhotoUrl } = await import("@/lib/storage.functions");
  const result = await getPublicItemPhotoUrl({ data: { path } });
  return result.url;
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buffer.length; i += 1) binary += String.fromCharCode(buffer[i]!);
  return btoa(binary);
}

export function formatDateBr(value: string | null) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}
