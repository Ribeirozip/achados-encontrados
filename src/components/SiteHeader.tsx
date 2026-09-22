import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Search className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Achados &amp; Perdidos</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
          >
            Encontrar meu objeto
          </Link>
          <Link
            to="/cadastrar-item"
            className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
          >
            Cadastrar item encontrado
          </Link>
          <Link
            to="/admin/login"
            className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
          >
            Equipe
          </Link>
        </nav>
      </div>
    </header>
  );
}
