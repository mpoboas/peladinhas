"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createTeam, deleteTeam } from "@/app/admin/actions";
import { useRefreshTransition } from "@/lib/use-refresh-transition";
import type { SessionTeam } from "@/lib/types";

const PRESETS = ["021", "022", "023", "024", "025"];

export function TeamQuickAdd({
  sessionId,
  teams,
}: {
  sessionId: string;
  teams: SessionTeam[];
}) {
  const { pending, refresh } = useRefreshTransition();
  const [name, setName] = useState("");
  const existing = new Set(teams.map((t) => t.name));

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          refresh(async () => {
            await createTeam(sessionId, trimmed);
            setName("");
          });
        }}
        className="flex gap-2"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da equipa"
          className="flex-1"
        />
        <Button type="submit" disabled={pending || !name.trim()}>
          Adicionar
        </Button>
      </form>

      <div>
        <p className="mb-2 text-sm text-text-muted">Atalhos anos de praxe</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.filter((p) => !existing.has(p)).map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={pending}
              onClick={() => refresh(() => createTeam(sessionId, preset))}
              className="min-h-11 rounded-lg border border-white/15 bg-navy-light px-4 text-base font-medium hover:border-gold/40 hover:bg-gold/10"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {teams.length > 0 ? (
        <ul className="space-y-2">
          {teams.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-gold/25 bg-gold/10 px-4 py-3"
            >
              <span className="text-lg font-semibold text-text-primary">
                {t.name}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => refresh(() => deleteTeam(t.id, sessionId))}
                className="min-h-10 px-3 text-sm font-medium text-red-400"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">
          Ainda não há equipas. Adiciona pelo menos 2 para registar jogos.
        </p>
      )}
    </div>
  );
}
