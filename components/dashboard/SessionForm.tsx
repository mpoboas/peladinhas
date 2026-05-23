"use client";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { LocationAutocomplete } from "@/components/ui/LocationAutocomplete";
import { Select } from "@/components/ui/Select";
import { createSession, updateSession } from "@/app/admin/actions";
import { useRefreshTransition } from "@/lib/use-refresh-transition";
import { SESSION_LABEL_MAX_LENGTH } from "@/lib/session";
import type { Session } from "@/lib/types";

export function SessionForm({
  session,
  action,
  locations,
}: {
  session?: Session;
  action: "create" | "edit";
  locations: string[];
}) {
  const { pending, refresh } = useRefreshTransition();
  const dateValue = session?.date?.slice(0, 10) ?? "";

  function onSubmit(formData: FormData) {
    refresh(async () => {
      if (action === "create") {
        await createSession(formData);
      } else if (session) {
        await updateSession(session.id, formData);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <Field label="Data" hint="Quando foi a peladinha">
        <Input name="date" type="date" required defaultValue={dateValue} />
      </Field>

      <Field label="Tipo">
        <Select
          name="type"
          required
          defaultValue={action === "edit" ? (session?.type ?? "") : ""}
        >
          {action === "create" && (
            <option value="" disabled>
              Escolher tipo…
            </option>
          )}
          <option value="livre">Livre — sem classificação</option>
          <option value="torneio">Torneio — com classificação</option>
        </Select>
      </Field>

      <Field
        label="Local"
        hint={
          locations.length > 0
            ? "Escolhe um local anterior ou escreve um novo"
            : undefined
        }
      >
        <LocationAutocomplete
          locations={locations}
          defaultValue={session?.location ?? ""}
          required
          placeholder="Ex: Colégio Alemão, Porto"
        />
      </Field>

      <Field
        label="Nome (opcional)"
        hint={`Se vazio, usa "Peladinha #N" no site. Máx. ${SESSION_LABEL_MAX_LENGTH} caracteres.`}
      >
        <Input
          name="label"
          defaultValue={session?.label ?? ""}
          placeholder="Ex: Torneio Mai'26"
          maxLength={SESSION_LABEL_MAX_LENGTH}
        />
      </Field>

      <Field label="Custo total (€)">
        <Input
          name="cost"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          defaultValue={session?.cost ?? ""}
          placeholder="0.00"
        />
      </Field>

      <Field label="Notas">
        <textarea
          name="notes"
          rows={3}
          defaultValue={session?.notes ?? ""}
          placeholder="Opcional"
          className="touch-target w-full rounded-lg border border-white/15 bg-navy-light px-4 py-2.5 text-base"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending
          ? "A guardar…"
          : action === "create"
            ? "Criar peladinha"
            : "Guardar alterações"}
      </Button>
    </form>
  );
}
