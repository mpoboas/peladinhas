"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { modalBackdrop, modalPanel } from "@/lib/motion";
import { createMemberAndAttendance } from "@/app/admin/actions";
import { useRefreshTransition } from "@/lib/use-refresh-transition";

export function QuickMemberModal({
  open,
  sessionId,
  teamId,
  teamName,
  onClose,
}: {
  open: boolean;
  sessionId: string;
  teamId?: string | null;
  teamName?: string;
  onClose: () => void;
}) {
  const { pending, refresh } = useRefreshTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function handleSubmit(fd: FormData) {
    refresh(async () => {
      await createMemberAndAttendance(
        sessionId,
        fd,
        teamId ?? undefined,
      );
      onClose();
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-member-title"
          onClick={onClose}
          {...modalBackdrop}
        >
          <motion.div
            className="w-full max-w-lg rounded-xl border border-gold/30 bg-navy shadow-xl"
            onClick={(e) => e.stopPropagation()}
            {...modalPanel}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 id="quick-member-title" className="font-semibold text-gold">
                Novo membro
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
              {teamName && (
                <p className="text-sm text-text-secondary">
                  Fica marcado como presente na equipa{" "}
                  <span className="font-semibold text-gold">{teamName}</span>.
                </p>
              )}
              {!teamName && (
                <p className="text-sm text-text-secondary">
                  Fica marcado como presente nesta sessão.
                </p>
              )}

              <Field label="Nome">
                <Input name="name" required placeholder="Ex: João Silva" autoFocus />
              </Field>

              <Field label="Nº camisola (opcional)">
                <div className="max-w-[8rem]">
                  <Input
                    name="jersey_number"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="—"
                    className="text-center"
                  />
                </div>
              </Field>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="lg" className="flex-1" disabled={pending}>
                  {pending ? "A criar…" : "Criar e marcar"}
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
      )}
    </AnimatePresence>
  );
}
