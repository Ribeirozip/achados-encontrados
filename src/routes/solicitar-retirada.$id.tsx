import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ItemPhoto } from "@/components/ItemPhoto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { fetchItemById, formatDateBr, maskCpf, maskPhone } from "@/lib/lostfound";

export const Route = createFileRoute("/solicitar-retirada/$id")({
  head: () => ({
    meta: [
      { title: "Solicitar retirada — Achados & Perdidos" },
      {
        name: "description",
        content:
          "Confirme seus dados e comprove a propriedade para solicitar a retirada do objeto encontrado.",
      },
      { property: "og:title", content: "Solicitar retirada — Achados & Perdidos" },
      {
        property: "og:description",
        content:
          "Confirme seus dados e comprove a propriedade para solicitar a retirada do objeto encontrado.",
      },
    ],
  }),
  component: SolicitarRetirada,
});

function SolicitarRetirada() {
  const { id } = useParams({ from: "/solicitar-retirada/$id" });
  const { data: item, isLoading } = useQuery({
    queryKey: ["found-item", id],
    queryFn: () => fetchItemById(id),
  });

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [institutionalId, setInstitutionalId] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [approximateDate, setApproximateDate] = useState("");
  const [locationLost, setLocationLost] = useState("");
  const [ownership, setOwnership] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [declared, setDeclared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requestCode, setRequestCode] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    if (!fullName.trim()) return void toast.error("Informe seu nome completo.");
    if (cpf.replace(/\D/g, "").length !== 11) return void toast.error("Informe um CPF válido.");
    if (phone.replace(/\D/g, "").length < 10)
      return void toast.error("Informe um telefone válido.");
    if (!email.includes("@")) return void toast.error("Informe um e-mail válido.");
    if (!institutionalId.trim())
      return void toast.error("Informe sua matrícula ou identificação.");
    if (!ownership.trim())
      return void toast.error("Descreva uma característica exclusiva do seu objeto.");
    if (!declared) return void toast.error("É necessário confirmar a declaração.");


    setSaving(true);
    try {
      let proofPath: string | null = null;
      if (proof) {
        const extension = proof.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("proofs").upload(path, proof);
        if (uploadError) throw uploadError;
        proofPath = path;
      }

      const { data, error } = await supabase.rpc("create_recovery_request", {
        p_found_item_id: id,
        p_full_name: fullName.trim(),
        p_cpf: cpf,
        p_phone: phone,
        p_email: email.trim(),
        p_institutional_id: institutionalId.trim(),
        p_date_lost: dateLost || approximateDate.trim(),
        p_location_lost: locationLost.trim(),
        p_ownership_description: ownership.trim(),
        p_proof_url: proofPath ?? "",
      });

      if (error) throw error;
      setRequestCode(data as string);

    } catch {
      toast.error("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (requestCode) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-5 text-2xl font-semibold">Solicitação enviada!</h1>
        <p className="mt-3 text-muted-foreground">
          Recebemos suas informações. A equipe responsável irá analisar os dados e confirmar a
          retirada.
        </p>
        <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-5 text-left">
          <div>
            <p className="text-sm text-muted-foreground">Número da solicitação</p>
            <p className="text-2xl font-semibold tracking-wide text-primary">#{requestCode}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">Em análise</p>
          </div>
        </div>
        <Button asChild className="mt-8">
          <Link to="/">Voltar para a página inicial</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10">
      <h1 className="text-3xl font-semibold tracking-tight">Vamos confirmar que o objeto é seu</h1>
      <p className="mt-3 text-muted-foreground">
        Preencha seus dados para solicitar a retirada do objeto.
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando objeto...</p>
        ) : item ? (
          <>
            <ItemPhoto path={item.image_url} alt={item.name} className="h-20 w-20 rounded-2xl" />
            <div className="text-sm">
              <p className="text-base font-semibold">{item.name}</p>
              <p className="text-muted-foreground">{item.tags.slice(0, 3).join(" · ")}</p>
              <p className="text-muted-foreground">
                Encontrado em {item.location} · {formatDateBr(item.date_found)}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Objeto não encontrado ou indisponível.</p>
        )}
      </div>

      <div className="mt-8 space-y-8 rounded-3xl border border-border bg-card p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              inputMode="tel"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institutionalId">Matrícula / identificação institucional</Label>
            <Input
              id="institutionalId"
              value={institutionalId}
              onChange={(e) => setInstitutionalId(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dateLost">Quando você perdeu o objeto?</Label>
            <Input
              id="dateLost"
              type="date"
              value={dateLost}
              onChange={(e) => setDateLost(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="approximateDate">Ou uma data aproximada</Label>
            <Input
              id="approximateDate"
              value={approximateDate}
              onChange={(e) => setApproximateDate(e.target.value)}
              placeholder="Na semana passada, início de setembro..."
              className="h-12"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="locationLost">Local onde acredita ter perdido</Label>
            <Input
              id="locationLost"
              value={locationLost}
              onChange={(e) => setLocationLost(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownership">Como podemos confirmar que esse objeto é seu?</Label>
          <p className="text-sm text-muted-foreground">
            Conte algum detalhe que não aparece publicamente no cadastro do objeto.
          </p>
          <Textarea
            id="ownership"
            value={ownership}
            onChange={(e) => setOwnership(e.target.value)}
            rows={4}
            placeholder="Possui um pequeno risco na lateral direita, uma etiqueta interna ou algum detalhe específico..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proof">Comprovante de propriedade (opcional)</Label>
          <p className="text-sm text-muted-foreground">
            Você pode enviar uma foto, nota fiscal, imagem anterior do objeto ou outro documento que
            ajude a comprovar que ele pertence a você.
          </p>
          <label
            htmlFor="proof"
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary"
          >
            <Upload className="h-5 w-5" />
            {proof ? proof.name : "Selecionar arquivo (JPG, PNG ou PDF)"}
          </label>
          <input
            id="proof"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={(e) => setProof(e.target.files?.[0] ?? null)}
          />
        </div>

        <label className="flex items-start gap-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          <Checkbox
            checked={declared}
            onCheckedChange={(checked) => setDeclared(checked === true)}
            className="mt-0.5"
          />
          <span>
            Declaro que as informações fornecidas são verdadeiras e que sou o legítimo proprietário
            ou possuidor do objeto selecionado.
          </span>
        </label>

        <Button size="lg" className="h-12 w-full text-base" onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          Solicitar retirada
        </Button>
      </div>
    </div>
  );
}
