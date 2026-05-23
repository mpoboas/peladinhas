import type {
  SessionStoryData,
  SessionStoryGameRow,
} from "@/lib/session-share";
import {
  STORY_HEIGHT,
  STORY_TOP_BLOCK_HEIGHT,
  STORY_WIDTH,
} from "@/lib/session-share";

const statCols = ["J", "V", "E", "D", "G", "PTS"] as const;

type TableBase = {
  headerFont: number;
  cellFont: number;
  teamFont: number;
  rowHeight: number;
  tableHeader: number;
};

type GameBase = {
  rowHeight: number;
  teamFont: number;
  scoreFont: number;
  labelFont: number;
};

function baseTableLayout(rowCount: number): TableBase {
  if (rowCount <= 4) {
    return {
      headerFont: 20,
      cellFont: 28,
      teamFont: 32,
      rowHeight: 68,
      tableHeader: 44,
    };
  }
  if (rowCount <= 6) {
    return {
      headerFont: 19,
      cellFont: 26,
      teamFont: 30,
      rowHeight: 60,
      tableHeader: 42,
    };
  }
  if (rowCount <= 8) {
    return {
      headerFont: 18,
      cellFont: 24,
      teamFont: 28,
      rowHeight: 54,
      tableHeader: 40,
    };
  }
  return {
    headerFont: 17,
    cellFont: 22,
    teamFont: 26,
    rowHeight: 48,
    tableHeader: 38,
  };
}

function baseGameLayout(rowCount: number): GameBase {
  if (rowCount <= 3) {
    return { rowHeight: 96, teamFont: 30, scoreFont: 38, labelFont: 18 };
  }
  if (rowCount <= 5) {
    return { rowHeight: 80, teamFont: 28, scoreFont: 34, labelFont: 17 };
  }
  if (rowCount <= 8) {
    return { rowHeight: 68, teamFont: 24, scoreFont: 30, labelFont: 16 };
  }
  return { rowHeight: 58, teamFont: 22, scoreFont: 26, labelFont: 15 };
}

function computeStoryScale(
  rowCount: number,
  mode: "standings" | "games" | "none",
): number {
  let height = 64 * 2 + STORY_TOP_BLOCK_HEIGHT;

  if (mode === "standings" && rowCount > 0) {
    const table = baseTableLayout(rowCount);
    height += 28 + 40 + 16 + table.tableHeader + table.rowHeight * rowCount;
  } else if (mode === "games" && rowCount > 0) {
    const game = baseGameLayout(rowCount);
    height += 28 + 40 + 16 + game.rowHeight * rowCount;
  }

  const target = STORY_HEIGHT * 0.94;
  return Math.min(Math.max(target / height, 0.9), 1.85);
}

function fitGames(
  games: SessionStoryGameRow[],
  scale: number,
): SessionStoryGameRow[] {
  if (games.length === 0) return [];
  const s = (n: number) => Math.round(n * scale);
  const layout = baseGameLayout(games.length);
  const rowH = s(layout.rowHeight);
  const overhead = s(28) + s(40) + s(16);
  const topH = s(64) * 2 + s(STORY_TOP_BLOCK_HEIGHT);
  const available = STORY_HEIGHT - topH - overhead;
  const max = Math.max(1, Math.floor(available / rowH));
  return games.slice(0, max);
}

const colStyles = {
  team: { flex: "1 1 34%", minWidth: 0, textAlign: "left" as const },
  stat: { flex: "0 0 9.5%", textAlign: "center" as const },
};

function SessionHeaderBlock({
  data,
  s,
}: {
  data: SessionStoryData;
  s: (n: number) => number;
}) {
  const isTorneio = data.type === "torneio";

  return (
    <div style={{ flexShrink: 0 }}>
      <p
        style={{
          fontFamily: "var(--font-bebas), system-ui, sans-serif",
          fontSize: s(52),
          letterSpacing: "0.06em",
          color: "#f5c842",
          margin: 0,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Peladinhas da Invicta
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt=""
        width={s(112)}
        height={s(112)}
        style={{
          display: "block",
          margin: `${s(24)}px auto 0`,
          objectFit: "contain",
        }}
      />

      <div
        style={{
          marginTop: s(36),
          borderRadius: s(20),
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backgroundColor: "rgba(255, 255, 255, 0.06)",
          padding: `${s(28)}px ${s(32)}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: s(16),
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-bebas), system-ui, sans-serif",
              fontSize: data.title.length > 48 ? s(36) : s(46),
              lineHeight: 1.05,
              margin: 0,
              flex: 1,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {data.title}
          </h2>
          <span
            style={{
              flexShrink: 0,
              borderRadius: 999,
              border: isTorneio
                ? "1px solid rgba(245, 200, 66, 0.4)"
                : "1px solid #1a2f6a",
              backgroundColor: isTorneio
                ? "rgba(245, 200, 66, 0.15)"
                : "rgba(26, 47, 106, 0.8)",
              color: isTorneio ? "#f5c842" : "#7dd3fc",
              fontFamily: "var(--font-barlow-condensed), system-ui, sans-serif",
              fontSize: s(18),
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: `${s(5)}px ${s(14)}px`,
            }}
          >
            {isTorneio ? "Torneio" : "Livre"}
          </span>
        </div>

        <p
          style={{
            marginTop: s(16),
            marginBottom: 0,
            fontSize: s(26),
            color: "#b8c5d6",
            lineHeight: 1.35,
          }}
        >
          {data.location}
        </p>
        <p
          style={{
            marginTop: s(6),
            marginBottom: 0,
            fontSize: s(24),
            color: "#8fa3bc",
          }}
        >
          {data.date}
        </p>

        <div
          style={{
            marginTop: s(18),
            display: "flex",
            flexWrap: "wrap",
            gap: s(10),
          }}
        >
          {data.attendanceCount > 0 && (
            <StoryChip s={s}>{data.attendanceCount} jogadores</StoryChip>
          )}
          {data.gamesCount > 0 && (
            <StoryChip s={s}>{data.gamesCount} jogos</StoryChip>
          )}
        </div>
      </div>
    </div>
  );
}

function StoryChip({
  children,
  s,
}: {
  children: React.ReactNode;
  s: (n: number) => number;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 999,
        border: "1px solid rgba(255, 255, 255, 0.18)",
        padding: `${s(6)}px ${s(16)}px`,
        fontSize: s(22),
        color: "#b8c5d6",
      }}
    >
      {children}
    </span>
  );
}

export function SessionStorySlide({
  data,
  id,
}: {
  data: SessionStoryData;
  id: string;
}) {
  const isTorneio = data.type === "torneio";
  const hasStandings = isTorneio && data.standings.length > 0;
  const hasGames = !isTorneio && data.games.length > 0;

  let visibleGames = data.games;
  if (hasGames) {
    const initialScale = computeStoryScale(data.games.length, "games");
    visibleGames = fitGames(data.games, initialScale);
  }

  const bottomRows = hasStandings
    ? data.standings.length
    : visibleGames.length;
  const bottomMode = hasStandings
    ? "standings"
    : visibleGames.length > 0
      ? "games"
      : "none";

  const scale = computeStoryScale(bottomRows, bottomMode);
  const s = (n: number) => Math.round(n * scale);

  if (hasGames) {
    visibleGames = fitGames(data.games, scale);
  }

  const table = baseTableLayout(data.standings.length);
  const gameLayout = baseGameLayout(visibleGames.length || 1);

  return (
    <div
      id={id}
      style={{
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        backgroundColor: "#0d1b3e",
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(26, 47, 106, 0.5) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 100% 100%, rgba(245, 200, 66, 0.08) 0%, transparent 60%),
          repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255, 255, 255, 0.012) 40px, rgba(255, 255, 255, 0.012) 41px)
        `,
        color: "#ffffff",
        fontFamily: "var(--font-barlow), system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: `${s(64)}px ${s(48)}px`,
        boxSizing: "border-box",
      }}
    >
      <SessionHeaderBlock data={data} s={s} />

      {hasStandings && (
        <div style={{ flexShrink: 0, marginTop: s(28) }}>
          <p
            style={{
              fontFamily: "var(--font-bebas), system-ui, sans-serif",
              fontSize: s(40),
              letterSpacing: "0.04em",
              color: "#f5c842",
              margin: `0 0 ${s(16)}px`,
            }}
          >
            Classificação
          </p>

          <div
            style={{
              borderRadius: s(16),
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: s(table.tableHeader),
                padding: `0 ${s(20)}px`,
                borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              }}
            >
              <span
                style={{
                  ...colStyles.team,
                  fontSize: s(table.headerFont),
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#8fa3bc",
                }}
              >
                Equipa
              </span>
              {statCols.map((h) => (
                <span
                  key={h}
                  style={{
                    ...colStyles.stat,
                    fontSize: s(table.headerFont),
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#8fa3bc",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            <div>
              {data.standings.map((row, i) => (
                <div
                  key={row.teamName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: s(table.rowHeight),
                    padding: `0 ${s(20)}px`,
                    borderBottom:
                      i < data.standings.length - 1
                        ? "1px solid rgba(255, 255, 255, 0.08)"
                        : undefined,
                    backgroundColor:
                      i === 0
                        ? "rgba(245, 200, 66, 0.07)"
                        : i % 2 === 1
                          ? "rgba(255, 255, 255, 0.025)"
                          : "transparent",
                  }}
                >
                  <span
                    style={{
                      ...colStyles.team,
                      fontSize: s(table.teamFont),
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.teamName}
                  </span>
                  <span
                    style={{
                      ...colStyles.stat,
                      fontSize: s(table.cellFont),
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.played}
                  </span>
                  <span
                    style={{
                      ...colStyles.stat,
                      fontSize: s(table.cellFont),
                      fontVariantNumeric: "tabular-nums",
                      color: "#fad96a",
                    }}
                  >
                    {row.won}
                  </span>
                  <span
                    style={{
                      ...colStyles.stat,
                      fontSize: s(table.cellFont),
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.drawn}
                  </span>
                  <span
                    style={{
                      ...colStyles.stat,
                      fontSize: s(table.cellFont),
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.lost}
                  </span>
                  <span
                    style={{
                      ...colStyles.stat,
                      fontSize: s(table.cellFont - 2),
                      fontVariantNumeric: "tabular-nums",
                      color: "#b8c5d6",
                    }}
                  >
                    {row.goalsFor}:{row.goalsAgainst}
                  </span>
                  <span
                    style={{
                      ...colStyles.stat,
                      fontSize: s(table.cellFont),
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color: "#f5c842",
                    }}
                  >
                    {row.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {visibleGames.length > 0 && !isTorneio && (
        <div style={{ flexShrink: 0, marginTop: s(28) }}>
          <p
            style={{
              fontFamily: "var(--font-bebas), system-ui, sans-serif",
              fontSize: s(40),
              letterSpacing: "0.04em",
              color: "#f5c842",
              margin: `0 0 ${s(16)}px`,
            }}
          >
            Resultados
          </p>

          <div
            style={{
              borderRadius: s(16),
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              overflow: "hidden",
            }}
          >
            {visibleGames.map((game, i) => {
              const aWins = game.goalsA > game.goalsB;
              const bWins = game.goalsB > game.goalsA;
              const isDraw = game.goalsA === game.goalsB;

              return (
                <div
                  key={`game-${i}-${game.teamA}-${game.teamB}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: s(gameLayout.rowHeight),
                    padding: `${s(12)}px ${s(20)}px`,
                    borderBottom:
                      i < visibleGames.length - 1
                        ? "1px solid rgba(255, 255, 255, 0.08)"
                        : undefined,
                    backgroundColor:
                      i % 2 === 1 ? "rgba(255, 255, 255, 0.025)" : "transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: s(gameLayout.labelFont),
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#8fa3bc",
                      marginBottom: s(6),
                    }}
                  >
                    Jogo {i + 1}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: s(12),
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        textAlign: "right",
                        fontSize: s(gameLayout.teamFont),
                        fontWeight: 600,
                        color: aWins ? "#f5c842" : "#ffffff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {game.teamA}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontFamily: "var(--font-bebas), system-ui, sans-serif",
                        fontSize: s(gameLayout.scoreFont),
                        letterSpacing: "0.04em",
                        color: isDraw ? "#b8c5d6" : "#f5c842",
                        padding: `${s(4)}px ${s(12)}px`,
                        borderRadius: s(8),
                        backgroundColor: isDraw
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(245, 200, 66, 0.12)",
                      }}
                    >
                      {game.goalsA} – {game.goalsB}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontSize: s(gameLayout.teamFont),
                        fontWeight: 600,
                        color: bWins ? "#f5c842" : "#ffffff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {game.teamB}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

