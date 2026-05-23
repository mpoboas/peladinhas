export function sortGames<T extends { game_order?: number; created?: string }>(
  games: T[],
): T[] {
  return [...games].sort((a, b) => {
    const ao = a.game_order ?? 0;
    const bo = b.game_order ?? 0;
    if (ao > 0 && bo > 0 && ao !== bo) return ao - bo;
    if (ao !== bo) return ao - bo;
    return (a.created ?? "").localeCompare(b.created ?? "");
  });
}

/** Número visível do jogo (1-based) após ordenação. */
export function gameDisplayNumber(
  games: { id: string; game_order?: number; created?: string }[],
  gameId: string,
): number {
  const index = sortGames(games).findIndex((g) => g.id === gameId);
  return index >= 0 ? index + 1 : 1;
}
