# Cursor Prompt — Peladinhas da Invicta

## Contexto

Estou a converter um site estático em HTML (exportado de um chat de WhatsApp de um grupo de futebol de 5/7 entre amigos) para uma aplicação Next.js funcional com base de dados PocketBase. O site já tem um design definido — azul escuro (#0d1b3e) e dourado (#f5c842) — que deve ser preservado.

O site chama-se **Peladinhas da Invicta** e serve para registar sessões de futebol, jogos e resultados do grupo de amigos do ISEP, Porto.

---

## Stack técnica

- **Framework:** Next.js 15 com App Router e TypeScript
- **Base de dados / Backend:** PocketBase (self-hosted, será corrido localmente em `http://127.0.0.1:8090`)
- **Styling:** Tailwind CSS v4
- **PocketBase SDK:** `pocketbase` npm package
- **Sem ORM** — usar o PocketBase SDK diretamente

---

## Modelo de dados — Collections PocketBase

Criar as seguintes collections no PocketBase. Usa os nomes exatos.

### `members`
| Campo | Tipo | Notas |
|---|---|---|
| `nickname` | text (required) | Ex: "TT", "Hélder", "Saco" |
| `real_name` | text | Nome real opcional |
| `turma` | text | Ex: "021", "022", "externos" |
| `jersey_number` | number | Número de camisola (ex: 34) |
| `user` | relation → users | Conta PocketBase associada (opcional) |

### `sessions`
| Campo | Tipo | Notas |
|---|---|---|
| `date` | date (required) | Data da sessão |
| `location` | text (required) | Ex: "Colégio Alemão, Porto" |
| `type` | select (required) | Opções: `livre`, `torneio` |
| `player_count` | number | Número aproximado de jogadores |
| `cost_per_person` | number | Custo por pessoa em euros |
| `notes` | text | Notas livres |
| `label` | text | Nome curto para torneios (ex: "Torneio Mai'26") |

### `teams`
| Campo | Tipo | Notas |
|---|---|---|
| `name` | text (required) | Ex: "021", "Terceira Idade" |
| `color` | text | Hex color opcional |
| `session` | relation → sessions (required) | A equipa pertence a uma sessão |

### `team_members`
Tabela de junção entre equipas e membros dentro de uma sessão.
| Campo | Tipo | Notas |
|---|---|---|
| `team` | relation → teams (required) | |
| `member` | relation → members (required) | |

### `games`
| Campo | Tipo | Notas |
|---|---|---|
| `session` | relation → sessions (required) | |
| `team_a` | relation → teams (required) | |
| `team_b` | relation → teams (required) | |
| `goals_a` | number (required) | |
| `goals_b` | number (required) | |
| `notes` | text | Ex: "jogo contestado" |
| `game_order` | number | Ordem do jogo dentro da sessão |

---

## Estrutura de pastas do projeto

```
/
├── app/
│   ├── layout.tsx              # Root layout com header e footer
│   ├── page.tsx                # Homepage com stats e últimas sessões
│   ├── sessions/
│   │   ├── page.tsx            # Lista de todas as sessões
│   │   └── [id]/
│   │       └── page.tsx        # Detalhe de uma sessão com jogos
│   ├── members/
│   │   └── page.tsx            # Lista de membros com stats
│   ├── dashboard/
│   │   ├── layout.tsx          # Layout protegido (redireciona se não autenticado)
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── sessions/
│   │   │   ├── new/page.tsx    # Criar nova sessão
│   │   │   └── [id]/edit/page.tsx  # Editar sessão + gerir jogos
│   │   └── members/
│   │       └── page.tsx        # Gerir membros
│   ├── login/
│   │   └── page.tsx            # Página de login
│   └── api/
│       └── auth/
│           └── [...]/route.ts  # Rotas de autenticação se necessário
├── lib/
│   ├── pocketbase.ts           # Singleton do cliente PocketBase
│   └── types.ts                # Tipos TypeScript para cada collection
├── components/
│   ├── ui/                     # Componentes base (Button, Input, Badge, etc.)
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── sessions/
│   │   ├── SessionCard.tsx
│   │   └── GameRow.tsx
│   └── dashboard/
│       ├── SessionForm.tsx
│       ├── GameForm.tsx
│       └── MemberForm.tsx
└── middleware.ts               # Protege as rotas /dashboard/*
```

---

## Autenticação

- Usar a autenticação nativa do PocketBase (`pb.authStore`)
- O cliente PocketBase deve ser um **singleton** partilhado
- Criar um **middleware Next.js** que protege todas as rotas `/dashboard/*`
- Se o user não estiver autenticado, redirecionar para `/login`
- A página `/login` tem formulário de email + password, sem registo público (os admins criam as contas diretamente no PocketBase admin)
- Guardar o token de auth em cookie HttpOnly para SSR funcionar corretamente

### `lib/pocketbase.ts` (exemplo base)
```typescript
import PocketBase from 'pocketbase';

let pb: PocketBase;

export function getPocketBase() {
  if (!pb) {
    pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
  }
  return pb;
}
```

---

## Design — preservar identidade visual existente

O site atual tem este design que deve ser preservado:

**Cores:**
- Background principal: `#0d1b3e` (azul escuro navy)
- Background secundário (cards): `#112050` (azul ligeiramente mais claro)
- Accent dourado: `#f5c842`
- Texto principal: `#ffffff`
- Texto secundário: `#94a3b8`
- Bordas subtis: `rgba(255,255,255,0.08)`

**Tipografia:**
- Títulos grandes: uppercase, bold, letras espaçadas (`tracking-widest`)
- Nome "PELADINHAS" em branco; "DA INVICTA" em dourado — manter este padrão nos headings principais

**Componentes visuais a preservar:**
- Stats bar no hero (números grandes em dourado com label em uppercase pequeno abaixo)
- Cards de sessão com data em destaque à esquerda (dia grande + mês pequeno em dourado)
- Badge de tipo (TORNEIO / LIVRE) no canto dos cards
- Tab navigation horizontal com underline dourado no tab ativo
- Tabelas de classificação com fundo ligeiramente diferente nas linhas alternadas
- Footer com a quote: *"Só mais 4 crlhs" — TT, sempre*

**Tailwind config** — adicionar estas custom colors:
```js
colors: {
  navy: {
    DEFAULT: '#0d1b3e',
    light: '#112050',
    lighter: '#1a2f6a',
  },
  gold: {
    DEFAULT: '#f5c842',
    light: '#fad96a',
    dark: '#d4a520',
  }
}
```

---

## Páginas — comportamento esperado

### `/` (Homepage)
- Hero com logo, título "PELADINHAS / DA INVICTA", subtítulo "Porto · ISEP"
- Stats bar: total de sessões, total de torneios, total de membros, última sessão
- As stats são calculadas dinamicamente a partir da base de dados
- Secção "Últimas sessões" com os 3-5 cards mais recentes
- Link para `/sessions` para ver todas

### `/sessions` (Histórico de sessões)
- Lista completa de sessões ordenadas por data descendente
- Cada card mostra: data, local, tipo, nº jogadores, custo/pessoa, notas
- Click num card vai para `/sessions/[id]`

### `/sessions/[id]` (Detalhe de sessão)
- Info da sessão no topo
- Se for torneio: tabela de classificação calculada a partir dos jogos
  - Colunas: Equipa | J | V | E | D | GM | GS | Pts
  - 3 pts vitória, 1 empate, 0 derrota
- Lista de todos os jogos com resultado
- Se for sessão livre: apenas lista de jogos (sem classificação)

### `/members` (Membros)
- Grid de cards com nickname, turma, número de camisola
- Stat de presença: nº de sessões em que participou (via team_members)
- Ordenado por nº de sessões descendente

### `/login`
- Formulário simples: email + password
- Botão "Entrar"
- Sem link de registo
- Após login com sucesso: redirecionar para `/dashboard`

### `/dashboard` (protegido)
- Overview: sessões recentes, ação rápida "Nova sessão"
- Navegar para gerir sessões e membros

### `/dashboard/sessions/new`
- Formulário para criar sessão: data, local, tipo (select), nº jogadores, custo, notas, label
- Após criar: redirecionar para `/dashboard/sessions/[id]/edit`

### `/dashboard/sessions/[id]/edit`
- Editar info da sessão
- Gerir equipas: criar equipas para esta sessão, adicionar membros a cada equipa
- Gerir jogos: adicionar jogos (selecionar equipa A, equipa B, resultado)
- Os jogos são listados em ordem e podem ser editados inline

### `/dashboard/members`
- Tabela de todos os membros
- Ações: criar, editar, apagar

---

## Tipos TypeScript

```typescript
// lib/types.ts

export interface Member {
  id: string;
  nickname: string;
  real_name?: string;
  turma?: string;
  jersey_number?: number;
  user?: string;
}

export interface Session {
  id: string;
  date: string;
  location: string;
  type: 'livre' | 'torneio';
  player_count?: number;
  cost_per_person?: number;
  notes?: string;
  label?: string;
}

export interface Team {
  id: string;
  name: string;
  color?: string;
  session: string;
  expand?: {
    session: Session;
  };
}

export interface TeamMember {
  id: string;
  team: string;
  member: string;
  expand?: {
    team: Team;
    member: Member;
  };
}

export interface Game {
  id: string;
  session: string;
  team_a: string;
  team_b: string;
  goals_a: number;
  goals_b: number;
  notes?: string;
  game_order?: number;
  expand?: {
    team_a: Team;
    team_b: Team;
  };
}

// Stat calculada para tabela de classificação
export interface StandingRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}
```

---

## Lógica de classificação (standings)

Esta função deve viver em `lib/standings.ts`:

```typescript
export function calculateStandings(teams: Team[], games: Game[]): StandingRow[] {
  const rows: Record<string, StandingRow> = {};

  for (const team of teams) {
    rows[team.id] = {
      team,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0,
    };
  }

  for (const game of games) {
    const a = rows[game.team_a];
    const b = rows[game.team_b];
    if (!a || !b) continue;

    a.played++; b.played++;
    a.goalsFor += game.goals_a; a.goalsAgainst += game.goals_b;
    b.goalsFor += game.goals_b; b.goalsAgainst += game.goals_a;

    if (game.goals_a > game.goals_b) {
      a.won++; a.points += 3; b.lost++;
    } else if (game.goals_b > game.goals_a) {
      b.won++; b.points += 3; a.lost++;
    } else {
      a.drawn++; a.points++; b.drawn++; b.points++;
    }
  }

  return Object.values(rows).sort((a, b) =>
    b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
  );
}
```

---

## Notas de implementação

1. **SSR vs Client:** As páginas públicas (`/`, `/sessions`, `/members`) devem ser Server Components com fetch direto ao PocketBase. As páginas de dashboard podem usar Client Components com o SDK normal.

2. **Variável de ambiente:** Criar `.env.local` com:
   ```
   NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
   ```

3. **Sem dados seed:** Não criar dados de exemplo. A base de dados começa vazia e o utilizador introduz os dados pelo dashboard.

4. **Error handling:** Wrap dos fetches com try/catch. Se a sessão não existir, retornar `notFound()` do Next.js.

5. **Loading states:** Usar `loading.tsx` do App Router para as páginas que fazem fetch.

6. **Datas:** Formatar datas em português (ex: "20 mai '26") — usar `date-fns` com locale `pt`.

7. **Responsivo:** O site deve funcionar bem em mobile (o grupo vai aceder pelo telemóvel). Mobile-first.

8. **Não criar testes** nesta fase.

---

## Ponto de partida

Começa por:
1. Criar o projeto Next.js com `npx create-next-app@latest` (TypeScript, Tailwind, App Router)
2. Instalar dependências: `pocketbase`, `date-fns`
3. Criar `lib/pocketbase.ts` e `lib/types.ts`
4. Criar o layout root com Header e Footer com o design correto
5. Criar a homepage (`app/page.tsx`)
6. Prosseguir pelas restantes páginas pela ordem listada acima
