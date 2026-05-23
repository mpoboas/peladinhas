"use server";

import {
  getAttendanceCountsBySession,
  getSessionsPaginated,
  SESSIONS_PAGE_SIZE,
} from "@/lib/queries";

export async function loadSessionsPage(
  page: number,
  includeCancelled: boolean,
) {
  const result = await getSessionsPaginated(page, SESSIONS_PAGE_SIZE, {
    includeCancelled,
  });
  const counts = await getAttendanceCountsBySession(
    result.items.map((s) => s.id),
  );
  return {
    items: result.items,
    counts,
    hasMore: result.hasMore,
  };
}
