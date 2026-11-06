# MVP — casa-criativa

> Criado em 02/11/2026. Revisto em 06/11/2026 (ciclo de 03/11). **Nível: Estudo (N1).** Meta: N1. Testado no Windows com Node 24 (com `better-sqlite3` 12 instalado só no clone de teste, ver #51) e no CI com Node 22. Não houve teste com pessoas nem em aparelho real.

## 1. Critérios: 7 de 10 aplicáveis atendidos

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

**Finalizado: não.** Faltam os critérios 3 (#48) e 8 (#49), que o código resolve. O critério 10 depende do responsável (#46).

## 2. Hipótese (proposta)

Praticar Node com SQLite: adicionar uma ideia em até 3 passos e achá-la pela categoria em 1 clique.

## 3. Fora do MVP

Contas, curtidas e moderação.

## 4. Neste ciclo (06/11/2026)

Filtro por categoria com contagem, landmarks e ordem de títulos, teste da página 500, CI nos PRs para `developer/**` e remoção dos arquivos legados. Detalhes em [PLANO-DE-ACAO.md](PLANO-DE-ACAO.md).
