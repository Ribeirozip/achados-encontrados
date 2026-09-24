import { Link } from "@tanstack/react-router";
import { Search, Plus, Users } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[3px_3px_0_var(--foreground)]">
            <Search className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-extrabold uppercase leading-none sm:text-lg">Achados &amp;<br className="hidden sm:block" /> Perdidos</span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto text-sm sm:gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="hidden rounded-xl px-3 py-2 font-semibold text-muted-foreground transition-colors hover:text-foreground md:block"
            activeProps={{ className: "bg-secondary text-primary" }}
          >
            Encontrar meu objeto
          </Link>
          <Link
            to="/cadastrar-item"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            activeProps={{ className: "bg-primary text-primary-foreground" }}
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Cadastrar item</span><span className="sm:hidden">Cadastrar</span>
          </Link>
          <Link
            to="/admin/login"
            aria-label="Acesso da equipe"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            activeProps={{ className: "border-primary bg-secondary text-primary" }}
          >
            <Users className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
