"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { GameEditModal } from "@/components/dashboard/GameEditModal";
import { listItem, springSnappy } from "@/lib/motion";
import { deleteGame, reorderGames } from "@/app/admin/actions";
import { useRefreshTransition } from "@/lib/use-refresh-transition";
import type { Game, SessionTeam } from "@/lib/types";

const iconAction =
  "flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors duration-200";

function teamName(game: Game, side: "a" | "b") {
  const expandKey = side === "a" ? "team_a" : "team_b";
  const expanded = game.expand?.[expandKey];
  if (expanded && typeof expanded === "object" && "name" in expanded) {
    return expanded.name;
  }
  return "—";
}

function GameRowContent({
  game,
  index,
  dragHandle,
}: {
  game: Game;
  index: number;
  dragHandle?: ReactNode;
}) {
  return (
    <>
      {dragHandle}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-light text-sm font-bold text-text-muted">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">
          <span className={game.goals_a > game.goals_b ? "text-gold" : ""}>
            {teamName(game, "a")}
          </span>
          <span className="mx-2 font-display text-xl text-gold">
            {game.goals_a} – {game.goals_b}
          </span>
          <span className={game.goals_b > game.goals_a ? "text-gold" : ""}>
            {teamName(game, "b")}
          </span>
        </p>
        {game.notes && (
          <p className="mt-1 truncate text-sm text-text-muted">{game.notes}</p>
        )}
      </div>
    </>
  );
}

function SortableGameRow({
  game,
  index,
  pending,
  onEdit,
  onDelete,
}: {
  game: Game;
  index: number;
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const dragHandle = (
    <button
      type="button"
      className={`${iconAction} shrink-0 cursor-grab touch-none hover:bg-navy-light hover:text-gold active:cursor-grabbing`}
      aria-label="Arrastar para reordenar"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5" />
    </button>
  );

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout="position"
      className={`flex items-center gap-2 rounded-xl border border-white/12 bg-surface p-3 transition-shadow duration-200 sm:gap-3 sm:p-4 ${
        isDragging ? "z-10 border-gold/40 opacity-40 shadow-none" : "shadow-sm"
      }`}
    >
      <GameRowContent game={game} index={index} dragHandle={dragHandle} />
      <div className="flex shrink-0 gap-0.5">
        <motion.button
          type="button"
          disabled={pending}
          onClick={onEdit}
          whileTap={{ scale: 0.9 }}
          className={`${iconAction} hover:bg-navy-light hover:text-gold`}
          aria-label="Editar jogo"
        >
          <Pencil className="h-4 w-4" />
        </motion.button>
        <motion.button
          type="button"
          disabled={pending}
          onClick={onDelete}
          whileTap={{ scale: 0.9 }}
          className={`${iconAction} hover:bg-red-950/50 hover:text-red-400`}
          aria-label="Apagar jogo"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export function GamesList({
  sessionId,
  teams,
  games,
}: {
  sessionId: string;
  teams: SessionTeam[];
  games: Game[];
}) {
  const { pending, refresh } = useRefreshTransition();
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sortedFromProps = useMemo(
    () =>
      [...games].sort(
        (a, b) => (a.game_order ?? 0) - (b.game_order ?? 0),
      ),
    [games],
  );

  const [orderedGames, setOrderedGames] = useState(sortedFromProps);

  useEffect(() => {
    setOrderedGames(sortedFromProps);
  }, [sortedFromProps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeGame = activeId
    ? orderedGames.find((g) => g.id === activeId)
    : null;
  const activeIndex = activeGame
    ? orderedGames.findIndex((g) => g.id === activeGame.id)
    : -1;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedGames.findIndex((g) => g.id === active.id);
    const newIndex = orderedGames.findIndex((g) => g.id === over.id);
    const next = arrayMove(orderedGames, oldIndex, newIndex);
    setOrderedGames(next);

    refresh(() =>
      reorderGames(
        sessionId,
        next.map((g) => g.id),
      ),
    );
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  if (games.length === 0) return null;

  const editingIndex = editingGame
    ? orderedGames.findIndex((g) => g.id === editingGame.id)
    : -1;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-secondary">
        Jogos registados ({games.length})
      </h3>
      <p className="text-xs text-text-muted">
        Arrasta pelo ícone à esquerda para alterar a ordem.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={orderedGames.map((g) => g.id)}
          strategy={verticalListSortingStrategy}
        >
          <motion.ul layout className="space-y-2">
            <AnimatePresence initial={false} mode="popLayout">
              {orderedGames.map((g, i) => (
                <motion.li
                  key={g.id}
                  layout
                  initial={listItem.initial}
                  animate={listItem.animate}
                  exit={listItem.exit}
                  transition={{
                    layout: springSnappy,
                    ...listItem.transition,
                  }}
                >
                  <SortableGameRow
                    game={g}
                    index={i}
                    pending={pending}
                    onEdit={() => setEditingGame(g)}
                    onDelete={() => {
                      if (
                        !confirm(
                          `Apagar jogo ${teamName(g, "a")} ${g.goals_a}–${g.goals_b} ${teamName(g, "b")}?`,
                        )
                      ) {
                        return;
                      }
                      refresh(() => deleteGame(g.id, sessionId));
                    }}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          {activeGame && activeIndex >= 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-gold/40 bg-surface p-3 shadow-lg ring-2 ring-gold/20 sm:gap-3 sm:p-4">
              <GameRowContent game={activeGame} index={activeIndex} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {editingGame && editingIndex >= 0 && (
          <GameEditModal
            key={editingGame.id}
            game={editingGame}
            sessionId={sessionId}
            teams={teams}
            order={editingIndex + 1}
            onClose={() => setEditingGame(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
