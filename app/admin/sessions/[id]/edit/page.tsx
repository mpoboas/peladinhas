import { notFound } from "next/navigation";
import { SessionEditor } from "@/components/dashboard/SessionEditor";
import {
  getMembers,
  getSessionLocations,
  getSessionRecordNumbers,
  getSessionWithDetails,
} from "@/lib/queries";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, members, recordNumbers, locations] = await Promise.all([
    getSessionWithDetails(id),
    getMembers(),
    getSessionRecordNumbers(),
    getSessionLocations(),
  ]);
  if (!data) notFound();

  return (
    <SessionEditor
      session={data.session}
      sessionId={id}
      recordNumber={recordNumbers[id] ?? 1}
      teams={data.teams}
      attendance={data.attendance}
      games={data.games}
      members={members}
      attendanceCount={data.attendanceCount}
      locations={locations}
    />
  );
}
