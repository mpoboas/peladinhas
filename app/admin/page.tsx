import Link from "next/link";
import { ExternalLink, Plus, Users } from "lucide-react";
import { DashboardSessionsList } from "@/components/dashboard/DashboardSessionsList";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSessionRecordNumbers, getSessionsPaginated } from "@/lib/queries";

export default async function DashboardPage() {
  const [initial, recordNumbers] = await Promise.all([
    getSessionsPaginated(1, undefined, { includeCancelled: false }),
    getSessionRecordNumbers(),
  ]);

  return (
    <div>
      <PageHeader
        title="Painel"
        subtitle="Gere peladinhas, resultados e membros."
      />

      <Link href="/admin/sessions/new" className="mb-6 block">
        <Button size="lg" className="w-full gap-2">
          <Plus className="h-5 w-5" aria-hidden />
          Nova peladinha
        </Button>
      </Link>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link
          href="/admin/members"
          className="flex min-h-24 flex-col justify-center rounded-xl border border-white/12 bg-surface p-4 transition hover:border-gold/30"
        >
          <Users className="h-7 w-7 text-gold" aria-hidden />
          <span className="mt-2 font-semibold">Membros</span>
          <span className="text-sm text-text-muted">Criar e editar</span>
        </Link>
        <Link
          href="/"
          className="flex min-h-24 flex-col justify-center rounded-xl border border-white/12 bg-surface p-4 transition hover:border-gold/30"
        >
          <ExternalLink className="h-7 w-7 text-gold" aria-hidden />
          <span className="mt-2 font-semibold">Site público</span>
          <span className="text-sm text-text-muted">Ver como jogador</span>
        </Link>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
        Peladinhas recentes
      </h2>
      <DashboardSessionsList
        initialSessions={initial.items}
        initialHasMore={initial.hasMore}
        recordNumbers={recordNumbers}
      />
    </div>
  );
}
