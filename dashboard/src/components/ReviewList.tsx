"use client";

import type { ReviewRow } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

const STATUSES = ["pending", "approved", "rejected", "outdated"] as const;

export function ReviewList({ rows }: { rows: ReviewRow[] }) {
  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-500">
          No extracted records yet.
        </p>
      ) : (
        rows.map((row) => <ReviewCard key={row.id} row={row} />)
      )}
    </div>
  );
}

function ReviewCard({ row }: { row: ReviewRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(row.review_status);
  const [classification, setClassification] = useState(row.category);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        status,
        classification,
        note: note || null,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setError(await response.text());
      return;
    }
    router.refresh();
  }

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">{row.mandal_name}</h2>
          <p className="text-sm text-stone-500">
            {row.category} · fetched {row.fetched_at}
          </p>
        </div>
        <StatusBadge status={row.review_status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-700">{row.context_snippet}</p>
      <p className="mt-2 break-all text-xs">
        <a className="text-[#1d5c45] underline" href={row.source_url} target="_blank" rel="noreferrer">
          {row.source_title || row.source_url}
        </a>
      </p>
      {row.raw_snapshot_path ? (
        <a className="mt-2 inline-block text-xs underline" href={`/api/snapshots/${row.raw_snapshot_path}`}>
          Source snapshot
        </a>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-stone-300 px-2 py-1 text-sm"
        >
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          value={classification}
          onChange={(event) => setClassification(event.target.value)}
          className="rounded-md border border-stone-300 px-2 py-1 text-sm"
          aria-label="classification"
        />
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Review note"
          className="min-w-56 flex-1 rounded-md border border-stone-300 px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md bg-[var(--accent)] px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save review"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-[var(--accent)]">{error}</p> : null}
    </article>
  );
}
