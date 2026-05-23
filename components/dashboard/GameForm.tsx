"use client";

import { useState } from "react";
import { GoalStepper } from "@/components/dashboard/GoalStepper";
import { GamesList } from "@/components/dashboard/GamesList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createGame } from "@/app/admin/actions";
import { useRefreshTransition } from "@/lib/use-refresh-transition";
import type { Game, SessionTeam } from "@/lib/types";

export function GameForm({
  sessionId,
  teams,
  games,
}: {
  sessionId: string;
  teams: SessionTeam[];
  games: Game[];
}) {
  const { pending, refresh } = useRefreshTransition();
  const [goalsA, setGoalsA] = useState(0);
  const [goalsB, setGoalsB] = useState(0);

  function handleSubmit(fd: FormData) {
    refresh(async () => {
      await createGame(sessionId, fd);
      setGoalsA(0);
      setGoalsB(0);
    });
  }

  if (teams.length < 2) {
    return (
      <EmptyState
        title="Faltam equipas"
        description='Vai ao separador "Equipas" e cria pelo menos 2 equipas antes de registar jogos.'
      />
    );
  }

  return (
    <div className="space-y-5">
      <form
        action={handleSubmit}
        className="space-y-4 rounded-xl border-2 border-gold/30 bg-navy-light/60 p-4"
      >
        <p className="text-center text-sm font-medium text-gold">
          Novo resultado
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Equipa A">
            <Select name="team_a" required defaultValue="">
              <option value="" disabled>
                Escolher…
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Equipa B">
            <Select name="team_b" required defaultValue="">
              <option value="" disabled>
                Escolher…
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex items-center justify-center gap-3">
          <GoalStepper name="goals_a" value={goalsA} onChange={setGoalsA} />
          <span className="font-display text-2xl text-text-muted">–</span>
          <GoalStepper name="goals_b" value={goalsB} onChange={setGoalsB} />
        </div>

        <Field label="Notas (opcional)">
          <Input name="notes" placeholder="Opcional" />
        </Field>

        <input type="hidden" name="game_order" value={games.length + 1} />

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "A guardar…" : "Guardar jogo"}
        </Button>
      </form>

      <GamesList sessionId={sessionId} teams={teams} games={games} />
    </div>
  );
}
