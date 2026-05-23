"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

/** Executa uma server action e refresca os Server Components da página. */
export function useRefreshTransition() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(
    (action: () => void | Promise<void>) => {
      // Async callback keeps the transition pending until both the action
      // and the subsequent refresh have committed, so the UI stays in sync
      // with the server-revalidated data.
      startTransition(async () => {
        await action();
        router.refresh();
      });
    },
    [router, startTransition],
  );

  return { pending, refresh };
}
