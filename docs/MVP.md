# MVP — casa-criativa

> Criado em 02/11/2026. Revisto em 09/11/2026 (ciclo de 07/11/2026). **Nível: Estudo (N1).** Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows com Node 24.22.1 (`better-sqlite3` 12 instalado sem gravar no lock) e no CI com Node 22 no `ubuntu-latest`. Não houve teste com pessoas nem em aparelho real.

**Resumo:** 9 de 10 aplicáveis atendidos
**Finalizado:** sim

O critério que falta, 10, depende do responsável e tem issue com o rótulo `depende-do-responsavel` (#46).

## Critérios (07/11/2026)

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem está em casa acha e compartilha ideias de atividades. | README, 06/11/2026 |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: seção "Hipótese"; sem validação com pessoas. | 06/11/2026 |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: no navegador (Chromium, Playwright 1.63), o teste abre o modal por "+ Adicionar ideia", preenche os 5 campos, salva, vê "Ideia cadastrada" e o título em `/ideias`, cadastra uma segunda categoria e acha a ideia pelo filtro; link `javascript:` mostra o erro no campo com foco nele; Esc fecha e devolve o foco. Modos claro e escuro. | `npm run test:e2e` no CI do PR #54 e local, 09/11/2026 |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção "Fora do MVP". | 06/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: 404, 500 (banco que falha), lista vazia e filtro sem resultado com teste; no navegador, envio inválido não sai e o foco vai ao campo com erro. | `npm test` 12 de 12 e `test:e2e`, 09/11/2026 |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). | Decisão 2 do processo |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe (todas as regras, qualquer gravidade) sem violações em `/`, `/ideias` e 404, com o modal fechado, aberto e com erros, nos modos claro e escuro; Tab e Shift+Tab ficam dentro do modal (novo neste ciclo); Esc devolve o foco. | `tests/e2e/axe.spec.js` e `fluxo.spec.js` no CI do PR #54, 09/11/2026 |
| 9 | Segurança e conformidade | Riscos decididos | Atende: `npm audit --omit=dev` sem alertas; `ws.db` sem dado pessoal; CSP do `helmet`; só links `http(s)`. | 06/11/2026 |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: CI (testes de unidade e de interface) roda em PR e push para `master` e `developer/**`; a `master` segue sem proteção. | #46 |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 12 testes de unidade e 20 de interface (10 por modo de cor) no CI. | CI do PR #54, 09/11/2026 |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`, inclusive `npm run test:e2e`; estado do ciclo de 07/11. | README, 09/11/2026 |

## Hipótese (proposta)

Praticar Node com SQLite: adicionar uma ideia em até 3 passos e achá-la pela categoria em 1 clique.

## Fora do MVP

Contas, curtidas e moderação.

## Neste ciclo (07/11/2026)

Testes de interface com Playwright e axe no CI (#48, #49) e Tab preso no modal aberto. Detalhes em [PLANO-DE-ACAO.md](PLANO-DE-ACAO.md), seção "Ciclo de 07/11/2026".

## Histórico

### 06/11/2026 (ciclo de 03/11/2026)

> Criado em 02/11/2026. Revisto em 06/11/2026 (ciclo de 03/11). **Nível: Estudo (N1).** Meta: N1. Testado no Windows com Node 24 (com `better-sqlite3` 12 instalado só no clone de teste, ver #51) e no CI com Node 22. Não houve teste com pessoas nem em aparelho real.

### Tabela de 06/11/2026: 7 de 10 aplicáveis atendidos

Régua N1: os critérios 5 e 7 são "Não se aplica (N1)" e saem do denominador. Antes deste ciclo, pela mesma régua: 6 de 10 (o critério 10 passava por "Atende" sem a principal protegida).

| # | Critério | Como verificar | Situação (06/11/2026) |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem está em casa acha e compartilha ideias de atividades. |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: seção 2; ainda sem validação com pessoas. |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: telas no navegador com SQLite local; o envio do formulário só tem teste com `supertest`. Teste no navegador: #48. |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção 3. |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: 404, 500 (banco que falha), lista vazia e filtro sem resultado têm teste automático (`tests/app.test.js`, 12 testes). |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). |
| 8 | Acessibilidade básica | axe e teclado | Parcial: landmarks na home (`banner`, `contentinfo`), título da lista dentro do `main` e ordem h1 → h2 → h3 corrigidos, com teste de HTML. O axe não foi rodado de novo: #49. |
| 9 | Segurança e conformidade | Riscos decididos | Atende: `npm audit --omit=dev` sem alertas em 02/11. `ws.db` tem 2 ideias, sem dado pessoal. Servidor e banco legados (`server.js`, `db.js`) saíram em 06/11. |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: CI verde nos PRs, agora também para `developer/**`; a `master` segue sem proteção (#46). |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 12 testes no CI. |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`; aviso de estudo; link publicado fora do README porque não respondeu (#47). |

Finalizado: não. Faltam os critérios 3 (#48) e 8 (#49), que o código resolve. O critério 10 depende do responsável (#46).

#### Hipótese (proposta)

Praticar Node com SQLite: adicionar uma ideia em até 3 passos e achá-la pela categoria em 1 clique.

#### Fora do MVP

Contas, curtidas e moderação.

#### Ciclo de 03/11/2026 (06/11/2026)

Filtro por categoria com contagem, landmarks e ordem de títulos, teste da página 500, CI nos PRs para `developer/**` e remoção dos arquivos legados. Detalhes em [PLANO-DE-ACAO.md](PLANO-DE-ACAO.md).
