"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { GoalStepper } from "@/components/dashboard/GoalStepper";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { modalBackdrop, modalPanel } from "@/lib/motion";
import { updateGame } from "@/app/admin/actions";
import { useRefreshTransition } from "@/lib/use-refresh-transition";
import type { Game, SessionTeam } from "@/lib/types";

export function GameEditModal({
  game,
  sessionId,
  teams,
  order,
  onClose,
}: {
  game: Game;
  sessionId: string;
  teams: SessionTeam[];
  order: number;
  onClose: () => void;
}) {
  const { pending, refresh } = useRefreshTransition();
  const [goalsA, setGoalsA] = useState(game.goals_a);
  const [goalsB, setGoalsB] = useState(game.goals_b);

  useEffect(() => {
    setGoalsA(game.goals_a);
    setGoalsB(game.goals_b);
  }, [game]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleSubmit(fd: FormData) {
    refresh(async () => {
      await updateGame(game.id, sessionId, fd);
      onClose();
    });
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-game-title"
      onClick={onClose}
      {...modalBackdrop}
    >
      <motion.div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gold/30 bg-navy shadow-xl"
        onClick={(e) => e.stopPropagation()}
        {...modalPanel}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="edit-game-title" className="font-semibold text-gold">
            Editar jogo #{order}
          </h2>
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.92 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors duration-200 hover:bg-surface hover:text-text-primary"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        <form action={handleSubmit} className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Equipa A">
              <Select name="team_a" required defaultValue={game.team_a}>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Equipa B">
              <Select name="team_b" required defaultValue={game.team_b}>
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
            <Input name="notes" defaultValue={game.notes ?? ""} placeholder="Opcional" />
          </Field>

          <input type="hidden" name="game_order" value={order} />

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="lg" className="flex-1" disabled={pending}>
              {pending ? "A guardar…" : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={pending}
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
