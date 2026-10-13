# Sistema visual — "Lunor"

Referência: `design/referencia-lunor.jpg` (abrir e olhar antes de mexer em qualquer ecrã). O objetivo é uma interface calma e clara: superfícies em cinza neutro quase preto, contornos de 1px, uma só família tipográfica, pouquíssima cor, hierarquia feita com tamanho, peso e espaço. A versão anterior era confusa por ter três fontes, etiquetas em maiúsculas monoespaçadas, fundos quadriculados, faixas de cor por fase, marcador amarelo e azul em todo o lado. Tudo isso sai.

## Regras

1. **Só tokens.** Todas as cores vêm de `src/styles/tokens.css` (`var(--…)`). Nunca escrever uma cor literal num componente. O tema escuro é o principal; o claro existe e tem de continuar legível (os tokens já tratam disso).
2. **Uma fonte**: `var(--font)` (Geist). `var(--mono)` só para código, `kbd` e números tabulares pequenos. Nada de serifas, nada de `text-transform: uppercase` nem `letter-spacing` largo em etiquetas.
3. **Escala de texto** (usar as variáveis): `--fs-xs` 12px (metadados), `--fs-sm` 13px (etiquetas, botões, linhas de lista), `--fs-md` 14px (texto de interface), `--fs-lg` 15px (títulos de cartão), `--fs-xl` 18px (subtítulos de página/secção), `--fs-2xl` 26px (título da página), `--fs-num` 30px (números grandes). Texto corrido longo (aula, apostila): 15px, `line-height: 1.75`, cor `--text-body`, largura máx. 70ch.
4. **Pesos**: 400 normal, 500 para títulos, botões e itens ativos. 600 só em casos raros. Nunca 700+.
5. **Cor de texto**: `--text` títulos e valores; `--text-2` etiquetas e descrições; `--text-3` metadados, eixos, placeholders.
6. **Cor de destaque**: não há azul de marca. O destaque é o branco (`--text`) e o botão principal é `.btn-primary` (claro sobre escuro). Cores semânticas (`--ok`, `--bad`, `--warn`, `--info`) só para estado: certo/errado, aprovado/reprovado, atraso. As cores das fases (`--f0` … `--f6`) só aparecem em pequenos ícones de pasta e pontos — nunca como faixas, fundos ou barras grandes.
7. **Superfícies**: página `--bg`; cartão `.card` = `--surface` + `1px solid var(--border)` + `border-radius: var(--r)` (12px) + padding 16px. Elementos dentro de um cartão (linhas, entradas, botões, painéis) usam `--surface-2` com `--border-2` e `--r-sm` (8px). Hover: `--surface-3`. Sem sombras, exceto em elementos flutuantes (`--shadow-pop`).
8. **Espaçamento**: múltiplos de 4. Entre cartões 12px; dentro de cartões 12–16px; entre secções de página 24px. Layout com `display:grid/flex` e `gap`, sem margens soltas.
9. **Ícones**: componente `Icon` (traço 1.5, 16px por omissão), cor `--text-2` ou `--text-3`.
10. **Densidade**: compacto como na referência. Botões 32px de altura (`.btn-sm` 28px). Linhas de lista 36px.
11. **Móvel**: tem de funcionar a 375px sem deslizamento horizontal. Grelhas passam a uma coluna; só tabelas, código e o gráfico de Gantt podem deslizar dentro do seu próprio contentor.
12. **Texto**: português europeu, frases curtas, sem floreados. Não mudar o conteúdo do curso, só a apresentação.

## Componentes base (já existem — reutilizar, não recriar)

Em `src/components/ui.tsx`:
- `Icon`, `Button` (`variant`: `primary` | `secondary` | `ghost` | `danger` | `quiet`; `size`: `sm` | `md`), `ConfirmButton`, `Chip` (`tone`: neutral | ok | warn | bad | info), `Bar`, `Ring`, `Checkbox`, `CopyButton`, `Empty`, `Kbd`.
- `PageHeader({ crumbs, title, subtitle, actions })` — barra de migalhas (ícone + "Hoje", ou "Percurso › Fase 0 › M1") e título da página com ações à direita. **Todas as páginas começam com ele.**
- `Card({ title, actions, children, className, id, ariaLabel })` — cartão com cabeçalho opcional.
- `StatTile({ label, value, unit, note, illus, onClick })` — o cartão de número com painel ilustrado à direita (como "Active Contracts 150").
- `Illus({ kind })` — ilustrações em cinza: `docs`, `check`, `folder`, `clock`, `cards`, `calendar`, `cap`, `chart`.
- `FolderCard({ dot, meta, title, desc, footer, onOpen, muted, className })` — o cartão de pasta (como "NDA Agreement"), com `footer` para os botões.
- `PartsStack({ parts })` — pequenos círculos sobrepostos (como os avatares da referência) que mostram as partes de um módulo feitas.
- `Seg({ options, value, onChange, label })` — controlo segmentado (separadores).
- `RowItem` (classe `.row-item`) — linha embutida como "Growth Plan / James Walker".

Classes globais em `src/styles/base.css` (partilhadas — não redefinir noutros ficheiros): `.page`, `.card`, `.card-head`, `.card-title`, `.btn*`, `.icon-btn`, `.link-btn`, `.chip*`, `.kbd`, `.input`, `.input-sm`, `.field`, `.check*`, `.bar*`, `.ring*`, `.pill`, `.seg*`, `.confirm*`, `.empty*`, `.table-wrap`, `table`, `.prose`, `.md`, `.md-figure`, `.callout*`, `.code*`, `.syn-*`, `.eyebrow`, `.muted`, `.small`, `.mono`, `.row`, `.gap-sm`, `.wrap`, `.center-y`, `.sr-only`, `.c-ok`, `.c-bad`, `.lede`, `.row-item`, `.tasks`, `.tutor-err`, `.tutor-note`, `.answer-text`, `.criteria`, `.crit-list`, `.result*`, `.big-score`, `.grading-ai`, `.grading-foot`, `.tab-body`, `.narrow`, `.verdict`, `.tag`, `.grid-2`, `.grid-3`, `.stack`.

`.eyebrow` passou a ser uma etiqueta discreta (12px, `--text-3`, peso 500, sem maiúsculas). `.callout` é um painel `--surface-2` com contorno e um título pequeno; `.callout-key` tem um ponto branco antes do título (sem amarelo).

## Classes por área

Cada área tem o seu ficheiro CSS em `src/styles/` e prefixa as classes novas para não colidir:
- Painel → `dashboard.css`, prefixo `dash-`
- Percurso e Calendário → `course.css`, prefixos `course-`, `cal-`
- Página do módulo (cabeçalho, separadores, Plano, Apostila, Notas, modo documento) → `module.css`, prefixos `mod-`, `plan-`, `doc-`
- Aula, blocos e widgets → `lesson.css` (`lesson-`, `qc-`) e `widgets.css` (prefixos dos widgets existentes: `rn-`, `agents-`, `nest-`, `tl-`, `lab-`, `pipe-`, `cycle-`, `colab-`)
- Exercícios, prova, correção, gabarito → `exercises.css` (`ex-`, `cl-`, `order-`) e `exam.css` (`exam-`, `grade-`, `gab-`, `practice-`)
- Revisão, Projetos, Certificações, Biblioteca, Definições, Exame de fase → `pages.css` (`review-`, `proj-`, `cert-`, `lib-`, `set-`)
- Fecho de fase (exame, mini-projeto, gabarito da fase) → `phase.css`, prefixo `phase-`
- Widgets de cada módulo → `widgets-mN.css`, prefixo `mN-` (componentes em `src/components/widgets/mN/`)
- Tutor → `tutor.css` (`tutor-`, `bubble-`)
- Barra lateral, barra de topo, paleta de pesquisa → `shell.css` (não mexer)

