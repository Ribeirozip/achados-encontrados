import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { normalize } from "@/lib/lostfound";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
};

export function TagInput({ tags, onChange, placeholder, suggestions = [] }: Props) {
  const [value, setValue] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (tags.some((t) => normalize(t) === normalize(tag))) {
      setValue("");
      return;
    }
    onChange([...tags, tag]);
    setValue("");
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(value);
    } else if (event.key === "Backspace" && !value && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  const remainingSuggestions = suggestions.filter(
    (s) => !tags.some((t) => normalize(t) === normalize(s)),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remover ${tag}`}
              className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(value)}
          placeholder={tags.length ? "Adicionar outra..." : placeholder}
          className="min-w-[12rem] flex-1 bg-transparent px-1 py-1.5 text-base outline-none placeholder:text-muted-foreground"
        />
      </div>

      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {remainingSuggestions.slice(0, 14).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
