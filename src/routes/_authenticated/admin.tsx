import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  LogOut,
  MapPin,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateBr } from "@/lib/lostfound";
import {
  checkAdminAccess,
  claimFirstAdmin,
  getAdminFileUrl,
  listRecoveryRequests,
  updateRequestStatus,
  type AdminRequest,
} from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Solicitações de retirada — Achados & Perdidos" },
      {
        name: "description",
        content: "Painel da equipe para analisar e aprovar as solicitações de retirada de objetos.",
      },
      { property: "og:title", content: "Solicitações de retirada — Achados & Perdidos" },
      {
        property: "og:description",
        content: "Painel da equipe para analisar e aprovar as solicitações de retirada de objetos.",
      },
    ],
  }),
  component: AdminPanel,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  under_review: "Em análise",
  approved: "Aprovada",
  rejected: "Recusada",
  completed: "Concluída",
};

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendentes" },
  { key: "under_review", label: "Em análise" },
  { key: "approved", label: "Aprovadas" },
  { key: "rejected", label: "Recusadas" },
  { key: "completed", label: "Concluídas" },
];

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "approved" || status === "completed"
      ? "bg-primary/10 text-primary"
      : status === "rejected"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function AdminPanel() {
  const navigate = useNavigate();
  const check = useServerFn(checkAdminAccess);
  const claim = useServerFn(claimFirstAdmin);
  const list = useServerFn(listRecoveryRequests);
  const update = useServerFn(updateRequestStatus);
  const fileUrl = useServerFn(getAdminFileUrl);

  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});

  const load = async () => {
    const data = await list();
    setRequests(data);
  };

  useEffect(() => {
    void (async () => {
      try {
        let { isAdmin } = await check();
        if (!isAdmin) {
          const { granted } = await claim();
          isAdmin = granted;
        }
        if (!isAdmin) {
          setState("denied");
          return;
        }
        await load();
        setState("ready");
      } catch {
        setState("denied");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  );

  const handleAction = (
    request: AdminRequest,
    action: "under_review" | "approve" | "reject" | "complete",
  ) => {
    void (async () => {
      setBusy(request.id);
      try {
        await update({
          data: { id: request.id, action, note: notes[request.id] ?? "" },
        });
        await load();
        toast.success(
          action === "approve"
            ? "Retirada aprovada. Avise a pessoa para buscar o objeto."
            : action === "complete"
              ? "Objeto marcado como entregue."
              : action === "reject"
                ? "Solicitação recusada."
                : "Solicitação marcada como em análise.",
        );
      } catch {
        toast.error("Não foi possível atualizar a solicitação.");
      } finally {
        setBusy(null);
      }
    })();
  };

  const openProof = (request: AdminRequest) => {
    void (async () => {
      if (!request.proof_url) return;
      if (proofUrls[request.id]) {
        window.open(proofUrls[request.id], "_blank", "noopener");
        return;
      }
      const { url } = await fileUrl({ data: { bucket: "proofs", path: request.proof_url } });
      if (!url) {
        toast.error("Não foi possível abrir o comprovante.");
        return;
      }
      setProofUrls((prev) => ({ ...prev, [request.id]: url }));
      window.open(url, "_blank", "noopener");
    })();
  };

  const handleSignOut = () => {
    void (async () => {
      await supabase.auth.signOut();
      await navigate({ to: "/admin/login", replace: true });
    })();
  };

  if (state === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta conta não tem permissão para ver as solicitações. Peça a um administrador para
          liberar o seu acesso.
        </p>
        <Button className="mt-6" variant="outline" onClick={handleSignOut}>
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <div className="flex flex-col gap-3 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Solicitações de retirada
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confira os dados, confirme se o objeto é da pessoa e aprove a retirada.
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nenhuma solicitação nesta situação no momento.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((request) => {
            const isOpen = openId === request.id;
            return (
              <li
                key={request.id}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      #{request.request_code}
                    </p>
                    <h2 className="text-lg font-semibold">
                      {request.item?.name ?? "Objeto removido"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {request.item?.code} · solicitado por {request.full_name}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {request.item ? (
                    <>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {request.item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" /> Encontrado em{" "}
                        {formatDateBr(request.item.date_found)}
                      </span>
                    </>
                  ) : null}
                </div>

                <Button
                  variant="ghost"
                  className="mt-3 px-0 text-primary hover:bg-transparent"
                  onClick={() => setOpenId(isOpen ? null : request.id)}
                >
                  {isOpen ? "Ocultar dados" : "Ver dados da solicitação"}
                </Button>

                {isOpen ? (
                  <div className="mt-2 space-y-4 rounded-2xl bg-muted/60 p-4">
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <Field label="Nome completo" value={request.full_name} />
                      <Field label="CPF" value={request.cpf} />
                      <Field label="Telefone" value={request.phone} />
                      <Field label="E-mail" value={request.email} />
                      <Field label="Matrícula" value={request.institutional_id} />
                      <Field label="Quando perdeu" value={request.date_lost ?? "Não informado"} />
                      <Field
                        label="Onde acredita ter perdido"
                        value={request.location_lost ?? "Não informado"}
                      />
                    </dl>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Característica exclusiva informada
                      </p>
                      <p className="mt-1 text-sm">{request.ownership_description}</p>
                    </div>

                    {request.proof_url ? (
                      <Button variant="outline" size="sm" onClick={() => openProof(request)}>
                        <FileText className="h-4 w-4" /> Abrir comprovante
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem comprovante anexado.</p>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase text-muted-foreground">
                        Observação interna (opcional)
                      </label>
                      <Textarea
                        value={notes[request.id] ?? request.admin_note ?? ""}
                        onChange={(e) =>
                          setNotes((prev) => ({ ...prev, [request.id]: e.target.value }))
                        }
                        placeholder="Anotação para a equipe..."
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {request.status === "pending" ? (
                        <Button
                          variant="outline"
                          disabled={busy === request.id}
                          onClick={() => handleAction(request, "under_review")}
                        >
                          Marcar em análise
                        </Button>
                      ) : null}
                      {request.status === "pending" || request.status === "under_review" ? (
                        <>
                          <Button
                            disabled={busy === request.id}
                            onClick={() => handleAction(request, "approve")}
                          >
                            <CheckCircle2 className="h-4 w-4" /> Aprovar retirada
                          </Button>
                          <Button
                            variant="outline"
                            disabled={busy === request.id}
                            onClick={() => handleAction(request, "reject")}
                          >
                            <XCircle className="h-4 w-4" /> Recusar
                          </Button>
                        </>
                      ) : null}
                      {request.status === "approved" ? (
                        <Button
                          disabled={busy === request.id}
                          onClick={() => handleAction(request, "complete")}
                        >
                          Marcar como entregue
                        </Button>
                      ) : null}
                    </div>

                    {request.status === "approved" ? (
                      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 text-sm">
                        <p className="font-medium text-primary">Mensagem para o solicitante</p>
                        <p className="mt-1 text-muted-foreground">
                          “Sua solicitação foi aprovada. Você já pode retirar o objeto no Achados &
                          Perdidos, apresentando um documento com foto.”
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          O envio automático por e-mail ainda não está ativo — avise a pessoa pelo
                          contato informado acima.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
