# Plano de ação — Casa Criativa

Timebox: 40 min (triagem: ciclo completo).

| MoSCoW | Item | Ganho | Esforço | Status |
|---|---|---|---|---|
| Must | Corrigir include com nome errado (D1) | Alto | Baixo | ✅ |
| Must | Criar tabela por migration (D3) | Alto | Baixo | ✅ |
| Must | Validação no servidor + só URL http(s) (D4) | Alto | Baixo | ✅ |
| Must | Validação no navegador funcionando (D2) | Médio | Baixo | ✅ |
| Should | Acessibilidade do modal e contraste (D6) | Médio | Médio | ✅ axe 0 |
| Should | Camadas + testes | Médio | Médio | ✅ 8 testes |
| Should | Dependências limpas (D5) | Médio | Baixo | ✅ 0 vulnerabilidades |
| Could | Moderação de ideias | Médio | Médio | Próximo ciclo |
| Won't | Contas de usuário | Baixo | Alto | — |

## Ciclo de 03/11/2026

> Executado em 06/11/2026. Branch `feature/2026-11-06` → `developer/sprint-2026-11-12` → `master`. Nível: Estudo (N1), 10 critérios aplicáveis.

### Produto

**Problema e público.** Famílias e estudantes em casa procuram o que fazer. A Casa Criativa junta ideias cadastradas pela comunidade.

**Hipótese e meta.** Uma pessoa cadastra uma ideia em até 3 passos e acha ideias de um tipo em 1 clique. Sem medição de uso (N1).

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Catálogo pequeno pede filtro simples, não busca facetada | Filtro por categoria em `/ideias`, um clique, sem formulário | [Popupsmart: faceted search](https://popupsmart.com/blog/faceted-search-best-practices), [Prefixbox: faceted filtering](https://www.prefixbox.com/blog/faceted-filtering/) |
| Mostrar contagem e só opções que existem; permitir desfazer | Cada categoria mostra o total; só aparecem categorias cadastradas; "Todas" desfaz o filtro | [Algolia: faceted search](https://www.algolia.com/de/blog/ux/faceted-search-an-overview), [Designing Search UX, cap. 7](https://www.oreilly.com/library/view/designing-search-ux/9780470942239/20_chapter-07.html) |
| `<header>` e `<footer>` dentro de `<section>` não viram landmarks | Na home, `role="banner"` e `role="contentinfo"` explícitos; na lista, o título foi para dentro do `main` | [Deque: regra region](https://dequeuniversity.com/rules/axe/4.7/region), [Rocket Validator: region](https://rocketvalidator.com/accessibility-validation/axe/4.12/region) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | Remover `server.js`, `db.js`, `ci/`, `yarn.lock` e `allIdeas.html` legados | Médio | Baixo | Este ciclo |
| 2 | CI também nos PRs para `developer/**` | Alto | Baixo | Este ciclo |
| 3 | Landmarks e ordem de títulos | Médio | Baixo | Este ciclo |
| 4 | Filtro por categoria com contagem | Médio | Baixo | Este ciclo |
| 5 | Teste da página 500 | Médio | Baixo | Este ciclo |
| 6 | Teste do cadastro no navegador | Alto | Médio | Issue #48 |
| 7 | axe automático no CI | Médio | Médio | Issue #49 |
| 8 | Busca por texto | Médio | Baixo | Issue #50 |
| 9 | `better-sqlite3` 12 e branches do Dependabot | Médio | Baixo | Issue #51 |
| 10 | Proteger a `master` | Alto | Baixo | Responsável (#46) |
| 11 | Publicação no Render | Baixo | Baixo | Responsável (#47) |

**Fora do escopo.** Contas, curtidas, moderação, banco persistente.

### Engenharia

**Arquitetura.** Express 4 com Nunjucks renderizando no servidor. `src/app.js` recebe o repositório por injeção; `src/ideaRepository.js` faz as consultas preparadas no SQLite (`better-sqlite3`); `src/db/connection.js` cria e migra a tabela. O filtro usa `?categoria=` e consulta com `COLLATE NOCASE`.

**Riscos.**
- `better-sqlite3` 11 não instala no Node 24 do Windows (#51); o CI usa Node 22.
- O SQLite do Render fica em `/tmp` e volta ao seed a cada deploy.
- Sem proteção na `master`, um push direto entra sem CI (#46).

**Qualidade.**
- Testes: 12 com `node:test` e `supertest` (validação, PRG, XSS, 404, 500, migração, filtro, ordem de títulos, landmarks).
- Acessibilidade: foco visível já existia; landmarks e títulos corrigidos; o filtro marca a categoria ativa com `aria-current`.
- Segurança: helmet com CSP, só links `http(s)`, limite de 10 envios por minuto; o parâmetro do filtro é cortado em 40 caracteres e vai por consulta preparada.

**Definição de pronto.** `npm ci` e `npm test` passam; CI verde no PR; `docs/MVP.md` e README atualizados.

### Plano de ação

**Este ciclo executa.** Itens 1 a 5 do backlog e a revisão do `MVP.md` pela régua N1 e pela decisão do critério 10.

**Vira issue.** #48, #49, #50, #51 (agente); #46, #47 (responsável).
