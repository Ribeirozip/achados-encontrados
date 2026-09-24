import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { normalize } from "@/lib/lostfound";
import { Button } from "@/components/ui/button";

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
      <div className="flex min-h-16 flex-wrap items-center gap-2 rounded-xl border border-input bg-card p-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
          >
            {tag}
            <Button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remover ${tag}`}
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full p-0 hover:bg-primary/20"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
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
            <Button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              variant="outline"
              size="sm"
              className="rounded-full bg-card"
            >
              <Plus className="h-3.5 w-3.5" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
