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

## Ciclo de 07/11/2026

> Executado em 09/11/2026. Branch `feature/2026-11-07` → `developer/sprint-2026-11-12` → `master` (o PR para a `master` fica aberto para o responsável). Nível: Estudo (N1), 10 critérios aplicáveis.

### Produto

**Problema e público.** Os mesmos do ciclo anterior: quem está em casa procura e compartilha ideias de atividades.

**Hipótese e meta.** Adicionar uma ideia em até 3 passos e achá-la pela categoria em 1 clique. Meta do ciclo: provar o fluxo e a acessibilidade no navegador, no CI (#48, #49).

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Em diálogo modal, o Tab circula só dentro dele; Esc fecha e o foco volta a quem abriu | O modal já fazia Esc e devolvia o foco; faltava prender o Tab. Feito, com teste | [W3C WAI-ARIA APG: Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |
| `@axe-core/playwright` é a integração oficial da Deque; o costume é varrer uma lista de rotas e falhar o build com violação | `tests/e2e/axe.spec.js` varre `/`, `/ideias` e 404, e também o modal aberto e com erros | [Deque: axe-core-npm / Playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright), [DEV: axe + Playwright no CI](https://dev.to/subito/how-we-automate-accessibility-testing-with-playwright-and-axe-3ok5) |
| O `webServer` do Playwright sobe o app antes dos testes e espera uma URL responder | `playwright.config.js` sobe `node src/server.js` com banco novo em pasta temporária e espera `/health` | [Playwright: webServer](https://playwright.dev/docs/test-webserver) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | Fluxo de cadastro no navegador, no CI | Alto | Médio | Este ciclo (#48) |
| 2 | axe nas páginas, no CI | Alto | Baixo | Este ciclo (#49) |
| 3 | Tab preso no modal | Médio | Baixo | Este ciclo |
| 4 | Busca por texto na lista | Médio | Baixo | #50 |
| 5 | `better-sqlite3` 12 e branches do Dependabot | Médio | Baixo | #51 |
| 6 | Proteger a `master` | Alto | Baixo | Responsável (#46) |
| 7 | Decidir a publicação | Médio | Baixo | Responsável (#47) |

**Fora do escopo.** Contas, curtidas e moderação.

### Engenharia

**Arquitetura.** Sem mudança no app. Testes de interface em `tests/e2e/` (Playwright 1.63, Chromium), fora do `node --test` (que só pega `*.test.js`). Projetos "claro" e "escuro" (`colorScheme`). Pedidos para fora de `localhost` são abortados no teste, para não depender de rede.

**Riscos.**
- `playwright install --with-deps` no Ubuntu 26.04 pode levar minutos; o job tem `timeout-minutes: 25`.
- No Windows, com a máquina carregada, o teste do axe na página 404 estourou o tempo em `frame.evaluate` (2 de 20); o mesmo axe rodado à parte na 404 deu 0 violações em 2 s. Decide o CI.

**Qualidade.** 12 testes de unidade e 20 de interface; o job `interface` guarda os traces quando falha.

**Definição de pronto.** `npm test` e `npm run test:e2e` verdes no CI; `docs/MVP.md` e README atualizados.

### Plano de ação

**Este ciclo executa.**
1. Playwright com fluxo de cadastro, erro de link e teclado no modal (#48).
2. axe em `/`, `/ideias` e 404, com o modal aberto e com erros (#49).
3. Tab preso no modal aberto, com teste.
4. Job `interface` no CI; `docs/MVP.md` com uma tabela só e histórico; README.

**Vira issue.** Seguem abertas #50 e #51 (agente) e #46 e #47 (responsável). Novas: #55 (interface em 375 px) e #56 (responsável: mesclar o ciclo).
