import { SessionForm } from "@/components/dashboard/SessionForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSessionLocations } from "@/lib/queries";

export default async function NewSessionPage() {
  const locations = await getSessionLocations();

  return (
    <div>
      <PageHeader
        title="Nova peladinha"
        subtitle="Preenche o básico. Depois adicionas equipas, presenças e jogos."
      />
      <SessionForm action="create" locations={locations} />
    </div>
  );
}
