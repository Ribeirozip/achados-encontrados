import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { getPhotoUrl } from "@/lib/lostfound";
import { cn } from "@/lib/utils";

export function ItemPhoto({
  path,
  alt,
  className,
}: {
  path: string | null;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPhotoUrl(path)
      .then((value) => {
        if (active) setUrl(value);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <div className={cn("flex items-center justify-center overflow-hidden bg-muted", className)}>
      {url ? (
        <img src={url} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <ImageOff className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  );
}
