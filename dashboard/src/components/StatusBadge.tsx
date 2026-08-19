export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-[var(--highlight-soft)] text-[var(--foreground)] ring-1 ring-[var(--border)]",
    approved: "bg-[var(--brand-green)] text-[var(--brand-white)]",
    rejected: "bg-[var(--accent-soft)] text-[var(--accent)]",
    outdated: "bg-[var(--surface-muted)] text-[var(--muted)]",
    complete: "bg-[var(--brand-green)] text-[var(--brand-white)]",
    partial: "bg-[var(--highlight-soft)] text-[var(--foreground)] ring-1 ring-[var(--border)]",
    missing: "bg-[var(--surface-muted)] text-[var(--muted)]",
    completed: "bg-[var(--brand-green)] text-[var(--brand-white)]",
    failed: "bg-[var(--accent-soft)] text-[var(--accent)]",
    running: "bg-[var(--highlight-soft)] text-[var(--foreground)] ring-1 ring-[var(--brand-green)]/40",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? "bg-[var(--surface-muted)] text-[var(--muted)]"
      }`}
    >
      {status}
    </span>
  );
}
