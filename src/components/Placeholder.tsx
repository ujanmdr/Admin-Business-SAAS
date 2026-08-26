import { PageHeader } from "./PageHeader";
import { Sparkles } from "lucide-react";

export function Placeholder({ title, description, eyebrow }: { title: string; description: string; eyebrow?: string }) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow ?? "Module"} title={title} description={description} />
      <div className="rounded-3xl border border-border bg-card shadow-luxe p-10 md:p-16 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-sand-soft grid place-items-center mb-6">
          <Sparkles className="h-7 w-7 text-gold" />
        </div>
        <h2 className="font-serif text-3xl mb-2">Crafted with care</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          This module is part of the BRG luxury suite. Detailed views, filters and analytics
          will appear here, designed to keep your salon running calmly and beautifully.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-mist-soft border border-border px-4 py-2 text-xs text-deep-olive">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Coming soon · {eyebrow ?? "BRG Suite"}
        </div>
      </div>
    </div>
  );
}
