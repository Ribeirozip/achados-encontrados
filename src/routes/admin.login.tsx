import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Acesso da equipe — Achados & Perdidos" },
      {
        name: "description",
        content: "Área restrita da equipe do Achados & Perdidos para analisar solicitações.",
      },
      { property: "og:title", content: "Acesso da equipe — Achados & Perdidos" },
      {
        property: "og:description",
        content: "Área restrita da equipe do Achados & Perdidos para analisar solicitações.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void (async () => {
      setLoading(true);
      try {
        const { error } =
          mode === "signin"
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (error) {
          toast.error(
            mode === "signin"
              ? "E-mail ou senha inválidos."
              : "Não foi possível criar o acesso. Verifique os dados.",
          );
          return;
        }

        await navigate({ to: "/admin" });
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <main className="page-shell py-10 sm:py-16">
      <div className="surface-panel mx-auto grid max-w-4xl overflow-hidden rounded-2xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex min-h-64 flex-col justify-between bg-primary p-7 text-primary-foreground sm:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase opacity-70">Área interna</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-none">ACESSO DA EQUIPE</h1>
            <p className="mt-4 text-sm opacity-80">Ambiente seguro para analisar as solicitações de retirada.</p>
          </div>
        </div>
        <div className="p-6 sm:p-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary md:hidden">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-2xl font-bold md:mt-0">Entre com seus dados</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use o e-mail institucional cadastrado.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail institucional</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="equipe@instituicao.edu.br"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "Entrar" : "Criar acesso"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm font-semibold text-primary underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Primeiro acesso? Criar conta da equipe" : "Já tenho acesso, entrar"}
        </button>

        <p className="mt-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          A primeira conta criada recebe automaticamente o perfil de administrador. As demais
          precisam ser liberadas por um administrador.
        </p>
        </div>
      </div>
    </main>
  );
}
