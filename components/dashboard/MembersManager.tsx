"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import {
  createMember,
  deleteMember,
  updateMember,
} from "@/app/admin/actions";
import { useRefreshTransition } from "@/lib/use-refresh-transition";
import type { Member } from "@/lib/types";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

function MemberEditRow({
  member,
  onCancel,
  pending,
  refresh,
}: {
  member: Member;
  onCancel: () => void;
  pending: boolean;
  refresh: (action: () => void | Promise<void>) => void;
}) {
  return (
    <form
      action={(fd) =>
        refresh(async () => {
          await updateMember(member.id, fd);
          onCancel();
        })
      }
      className="space-y-4 rounded-xl border border-gold/30 bg-gold/5 p-4"
    >
      <Field label="Nome">
        <Input name="name" required defaultValue={member.name} />
      </Field>
      <Field label="Nº camisola (opcional)">
        <div className="max-w-[8rem]">
          <Input
            name="jersey_number"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="—"
            defaultValue={member.jersey_number ?? ""}
            className="text-center"
          />
        </div>
      </Field>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="submit" disabled={pending} className="w-full gap-1.5 sm:w-auto">
          <Check className="h-4 w-4" aria-hidden />
          {pending ? "A guardar…" : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={onCancel}
          className="w-full gap-1.5 sm:w-auto"
        >
          <X className="h-4 w-4" aria-hidden />
          Cancelar
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={pending}
          className="w-full gap-1.5 sm:ml-auto sm:w-auto"
          onClick={() => {
            if (
              !confirm(
                `Apagar ${member.name}? Remove também todas as presenças registadas.`,
              )
            ) {
              return;
            }
            refresh(() => deleteMember(member.id));
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Apagar
        </Button>
      </div>
    </form>
  );
}

export function MembersManager({ members }: { members: Member[] }) {
  const { pending, refresh } = useRefreshTransition();
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newJersey, setNewJersey] = useState("");

  const sorted = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return [...members]
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          String(m.jersey_number ?? "").includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }, [members, filter]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const fd = new FormData();
    fd.set("name", name);
    if (newJersey.trim()) fd.set("jersey_number", newJersey.trim());
    refresh(async () => {
      await createMember(fd);
      setNewName("");
      setNewJersey("");
    });
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-xl border-2 border-gold/30 bg-navy-light/60 p-4"
      >
        <p className="text-sm font-medium text-gold">Novo membro</p>

        <Field label="Nome">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: João Silva"
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Nº camisola (opcional)" hint="Deixa vazio se não souberes">
            <div className="max-w-[8rem]">
              <Input
                value={newJersey}
                onChange={(e) => setNewJersey(e.target.value)}
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="—"
                className="text-center"
              />
            </div>
          </Field>

          <Button
            type="submit"
            disabled={pending || !newName.trim()}
            className="w-full gap-2 sm:w-auto sm:min-w-[9.5rem]"
          >
            <Plus className="h-5 w-5 shrink-0" aria-hidden />
            {pending ? "A adicionar…" : "Adicionar"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Procurar membro…"
          className="touch-target w-full rounded-lg border border-white/15 bg-navy-light py-2.5 pl-10 pr-4 text-base text-text-primary placeholder:text-text-muted focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text-secondary">
          {filter.trim()
            ? `${sorted.length} de ${members.length}`
            : `${members.length} ${members.length === 1 ? "membro" : "membros"}`}
        </p>

        {members.length === 0 ? (
          <EmptyState
            title="Ainda não há membros"
            description="Adiciona o primeiro nome acima."
          />
        ) : sorted.length === 0 ? (
          <EmptyState
            title="Ninguém com esse nome"
            description="Tenta outro termo de pesquisa."
          />
        ) : (
          <ul className="space-y-2">
            {sorted.map((m) =>
              editingId === m.id ? (
                <li key={m.id}>
                  <MemberEditRow
                    member={m}
                    pending={pending}
                    refresh={refresh}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-white/12 bg-surface p-3"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-display text-lg text-gold"
                    aria-hidden
                  >
                    {getInitials(m.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text-primary">
                      {m.name}
                    </p>
                    {m.jersey_number != null && (
                      <p className="text-sm text-text-muted">
                        Camisola #{m.jersey_number}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setEditingId(m.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition hover:bg-navy-light hover:text-gold"
                      aria-label={`Editar ${m.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (
                          !confirm(
                            `Apagar ${m.name}? Remove também todas as presenças registadas.`,
                          )
                        ) {
                          return;
                        }
                        refresh(() => deleteMember(m.id));
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition hover:bg-red-950/50 hover:text-red-400"
                      aria-label={`Apagar ${m.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
