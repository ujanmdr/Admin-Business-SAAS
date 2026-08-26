export function PageHeader({
  eyebrow, title, description, actions,
}: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.24em] text-gold font-medium mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif text-4xl md:text-5xl text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
