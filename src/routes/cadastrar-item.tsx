import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, Upload } from "lucide-react";
import { toast } from "sonner";
import { TagInput } from "@/components/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  LOCATIONS,
  SENSITIVE_CATEGORIES,
  TAG_SUGGESTIONS,
  normalize,
} from "@/lib/lostfound";

export const Route = createFileRoute("/cadastrar-item")({
  head: () => ({
    meta: [
      { title: "Cadastrar item encontrado — Achados & Perdidos" },
      {
        name: "description",
        content:
          "Encontrou um objeto na instituição? Cadastre-o para que o proprietário possa localizá-lo.",
      },
      { property: "og:title", content: "Cadastrar item encontrado — Achados & Perdidos" },
      {
        property: "og:description",
        content:
          "Encontrou um objeto na instituição? Cadastre-o para que o proprietário possa localizá-lo.",
      },
    ],
  }),
  component: CadastrarItem,
});

function CadastrarItem() {
  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [timeFound, setTimeFound] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const isSensitive = useMemo(
    () =>
      categories.some((c) =>
        SENSITIVE_CATEGORIES.some((s) => normalize(s) === normalize(c)),
      ),
    [categories],
  );

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const finalLocation = location === "Outro" ? customLocation.trim() : location;

    if (categories.length === 0) return void toast.error("Selecione o tipo do objeto.");
    if (!name.trim()) return void toast.error("Informe o nome do objeto.");
    if (!finalLocation) return void toast.error("Informe onde você encontrou o objeto.");
    if (!dateFound) return void toast.error("Informe quando você encontrou o objeto.");
    if (!file && !isSensitive) return void toast.error("Adicione uma foto do objeto.");


    setSaving(true);
    try {
      let imagePath: string | null = null;
      if (file && !isSensitive) {
        const { uploadItemPhoto } = await import("@/lib/storage.functions");
        const uploaded = await uploadItemPhoto({
          data: { contentType: file.type, data: await fileToBase64(file) },
        });
        imagePath = uploaded.path;
      }

      const { data, error } = await supabase.rpc("create_found_item", {
        p_category: categories,
        p_name: name.trim(),
        p_description: description.trim(),
        p_tags: tags,
        p_location: finalLocation,
        p_date_found: dateFound,
        p_time_found: timeFound || "",
        p_image_url: imagePath ?? "",
        p_is_sensitive: isSensitive,
      });

      if (error) throw error;
      setCreatedCode(data as string);
    } catch {
      toast.error("Não foi possível cadastrar o objeto. Tente novamente.");

    } finally {
      setSaving(false);
    }
  };

  if (createdCode) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-5 text-2xl font-semibold">Objeto cadastrado com sucesso!</h1>
        <p className="mt-3 text-muted-foreground">
          Agora ele faz parte do banco de Achados &amp; Perdidos e poderá ser encontrado por quem
          perdeu.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Código do objeto</p>
          <p className="text-2xl font-semibold tracking-wide text-primary">{createdCode}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/">Voltar para a busca</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Cadastrar outro objeto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10">
      <h1 className="text-3xl font-semibold tracking-tight">Encontrou alguma coisa?</h1>
      <p className="mt-3 text-muted-foreground">
        Cadastre o objeto para que o proprietário possa encontrá-lo.
      </p>

      <div className="mt-8 space-y-8 rounded-3xl border border-border bg-card p-5 sm:p-8">
        <div>
          <Label className="text-base">Que tipo de objeto você encontrou?</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const selected = categories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={
                    selected
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      : "rounded-full border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
                  }
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {isSensitive && (
          <div className="flex gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p>
              Por segurança, documentos pessoais não terão suas informações ou imagens exibidas
              publicamente. O registro ficará disponível apenas para a equipe responsável.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nome do objeto</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Óculos de grau, garrafa térmica, fone bluetooth..."
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Adicione características</Label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Preto, grande, metálico..."
            suggestions={TAG_SUGGESTIONS}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descreva o objeto</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione características que possam ajudar o proprietário a reconhecer o objeto."
            rows={4}
          />
        </div>

        {!isSensitive && (
          <div className="space-y-2">
            <Label htmlFor="photo">Foto do objeto</Label>
            <p className="text-sm text-muted-foreground">
              Adicione uma foto para facilitar a identificação.
            </p>
            <label
              htmlFor="photo"
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary"
            >
              <Upload className="h-5 w-5" />
              {file ? file.name : "Selecionar imagem"}
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Onde você encontrou?</Label>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLocation(option)}
                className={
                  location === option
                    ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    : "rounded-full border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
                }
              >
                {option}
              </button>
            ))}
          </div>
          {location === "Outro" && (
            <Input
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Descreva o local"
              className="mt-2 h-12"
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Quando encontrou?</Label>
            <Input
              id="date"
              type="date"
              value={dateFound}
              onChange={(e) => setDateFound(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Horário (opcional)</Label>
            <Input
              id="time"
              type="time"
              value={timeFound}
              onChange={(e) => setTimeFound(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <Button size="lg" className="h-12 w-full text-base" onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          Cadastrar objeto
        </Button>
      </div>
    </div>
  );
}
