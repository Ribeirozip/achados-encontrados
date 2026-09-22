import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, CalendarDays, PackageSearch, Loader2 } from "lucide-react";
import { TagInput } from "@/components/TagInput";
import { ItemPhoto } from "@/components/ItemPhoto";
import { Button } from "@/components/ui/button";
import {
  TAG_SUGGESTIONS,
  fetchAvailableItems,
  rankItems,
  formatDateBr,
  type MatchResult,
} from "@/lib/lostfound";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Achados & Perdidos — Encontre o objeto que você perdeu" },
      {
        name: "description",
        content:
          "Descreva o objeto que você perdeu na instituição e veja possíveis correspondências entre os itens encontrados.",
      },
      { property: "og:title", content: "Achados & Perdidos — Encontre o objeto que você perdeu" },
      {
        property: "og:description",
        content:
          "Descreva o objeto que você perdeu na instituição e veja possíveis correspondências entre os itens encontrados.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (tags.length === 0) {
      toast.error("Adicione pelo menos uma característica do objeto.");
      return;
    }
    setLoading(true);
    try {
      const items = await fetchAvailableItems();
      setResults(rankItems(tags, items));
    } catch {
      toast.error("Não foi possível consultar os objetos agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <section className="pt-10 text-center sm:pt-16">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Perdeu alguma coisa?</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Descreva o que você perdeu e encontre possíveis correspondências entre os objetos
          encontrados na instituição.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold">O que você perdeu?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Digite uma característica e pressione Enter para criar uma etiqueta.
        </p>
        <div className="mt-4">
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Digite uma característica do objeto..."
            suggestions={TAG_SUGGESTIONS}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="h-12 flex-1 text-base" onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            Encontrar meu objeto
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 text-base">
            <Link to="/cadastrar-item">Encontrei alguma coisa</Link>
          </Button>
        </div>
      </section>

      {results !== null && (
        <section className="mt-10">
          {results.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold">Encontramos possíveis correspondências</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                  >
                    <div className="relative">
                      <ItemPhoto path={item.image_url} alt={item.name} className="h-44 w-full" />
                      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {item.matchPercent}% de correspondência
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {item.category?.[0] ?? "Objeto"}
                        </p>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> {item.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" /> {formatDateBr(item.date_found)}
                        </p>
                      </div>
                      <Button
                        className="mt-auto w-full"
                        onClick={() =>
                          navigate({ to: "/solicitar-retirada/$id", params: { id: item.id } })
                        }
                      >
                        Esse objeto é meu
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <PackageSearch className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">
                Não encontramos uma correspondência no momento.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => {
                  setResults(null);
                  setTags([]);
                }}
              >
                Tentar outra descrição
              </Button>
            </div>
          )}
        </section>
      )}

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Como funciona?</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "DESCREVA",
              text: "Conte como era o objeto que você perdeu usando características como tipo, cor, marca e outros detalhes.",
            },
            {
              step: "02",
              title: "ENCONTRE",
              text: "O sistema compara sua descrição com os objetos encontrados e mostra possíveis correspondências.",
            },
            {
              step: "03",
              title: "RECUPERE",
              text: "Selecione o objeto, confirme sua identidade e solicite a retirada.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-3xl border border-border bg-card p-6">
              <span className="text-2xl font-bold text-primary">{item.step}</span>
              <h3 className="mt-2 font-semibold tracking-wide">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          A seleção de um objeto não garante automaticamente a entrega. A equipe responsável poderá
          solicitar informações para confirmar que o item pertence a você.
        </p>
      </section>
    </div>
  );
}
