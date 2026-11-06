> **Projeto de estudo.** Estado conferido em 31/10/2026: os endereços que seguem fora do ar foram retirados deste README. Detalhes em [docs/AVALIACAO.md](docs/AVALIACAO.md) e próximos passos em [docs/PLANO-ESTRATEGICO.md](docs/PLANO-ESTRATEGICO.md).

<h1 align="center">Casa Criativa</h1>

<p align="center">Catálogo colaborativo de ideias de atividades para fazer em casa.</p>

<p align="center"><img alt="Casa Criativa" src="./public/img/casa-criativa-1.jpg" width="720"></p>

## 🧠 O que aprendi

> Proposta de 01/11/2026, escrita a partir do código e das dependências. Ajuste com a sua experiência.

- Renderizar páginas no servidor com Express e Nunjucks.
- Guardar ideias em SQLite com `better-sqlite3`.
- Escapar conteúdo e aceitar somente links `http(s)`.
- Limitar envios e testar com `node --test`.

## Estado e próximos passos (ciclo de 03/11/2026)

**O que foi feito** (06/11/2026, PRs #52 e #53)
- Filtro por categoria em `/ideias`, com contagem e opção "Todas".
- Landmarks na home e ordem de títulos h1 → h2 → h3 na lista.
- Teste da página 500 com banco que falha; agora são 12 testes.
- CI também nos PRs para `developer/**`.
- Arquivos legados removidos (`server.js`, `db.js`, `ci/`, `yarn.lock`, `allIdeas.html`).
- `docs/MVP.md` revisto pela régua de estudo: 7 de 10 critérios aplicáveis.

**O que queremos fazer**
- [#48](https://github.com/douglasabnovato/casa-criativa/issues/48) Teste do cadastro no navegador (Playwright).
- [#49](https://github.com/douglasabnovato/casa-criativa/issues/49) axe automático nas páginas.
- [#50](https://github.com/douglasabnovato/casa-criativa/issues/50) Busca por texto na lista.
- [#51](https://github.com/douglasabnovato/casa-criativa/issues/51) `better-sqlite3` 12 e branches do Dependabot.
- [#46](https://github.com/douglasabnovato/casa-criativa/issues/46) Proteger a `master` (responsável).
- [#47](https://github.com/douglasabnovato/casa-criativa/issues/47) Decidir a publicação: o link do Render não respondeu em 06/11 (responsável).

**Onde está a documentação**
- [docs/MVP.md](docs/MVP.md): critérios e estado.
- [docs/PLANO-DE-ACAO.md](docs/PLANO-DE-ACAO.md): seção "Ciclo de 03/11/2026", com pesquisa, backlog e engenharia.

## Problema e proposta

Quem passa longos períodos em casa procura o que fazer. A Casa Criativa reúne ideias (cursos, brincadeiras, filmes, livros) cadastradas pela própria comunidade.

- **Público:** famílias e estudantes em casa.
- **Métrica de sucesso:** ideias cadastradas por semana (`GET /health` mostra o total).

## Funcionalidades

- Home com as 2 ideias mais recentes e lista completa em `/ideias`, com filtro por categoria.
- Cadastro com validação no navegador e no servidor (erros por campo, foco no primeiro erro).
- Somente links `http(s)`; conteúdo escapado; limite de 10 envios por minuto.
- Páginas próprias para 404 e 500.

## Stack

Node 22 · Express 4 · Nunjucks · SQLite (better-sqlite3) · helmet · node:test + supertest.

## Como rodar

```sh
npm install
cp .env.example .env   # opcional
npm run dev            # http://localhost:3000
npm test               # 12 testes
```

Para reaproveitar as ideias do banco antigo, use `DATABASE_FILE=./ws.db` na primeira execução: a migration converte a tabela e descarta linhas inválidas.

## Publicação

- **Publicação:** Fora do ar desde a conferência de 31/10/2026, sem resposta também em 06/11/2026 (#47); para ver o projeto, rode localmente (seção "Como rodar"). O `render.yaml` continua no repositório.
- GitHub Pages não serve aqui: o projeto tem servidor Express e banco SQLite, e o Pages só publica arquivos estáticos.
- O SQLite de produção fica em `/tmp/casa-criativa.sqlite`: as ideias cadastradas **somem a cada reinício ou deploy** e o banco volta às 2 ideias iniciais.
- Passo a passo completo: [docs/DEPLOY.md](docs/DEPLOY.md).

## Documentação

- [docs/ANALISE.md](docs/ANALISE.md) · [docs/ARQUITETURA.md](docs/ARQUITETURA.md) · [docs/PLANO-DE-ACAO.md](docs/PLANO-DE-ACAO.md) · [docs/DEPLOY.md](docs/DEPLOY.md)

Projeto iniciado no workshop Rocketseat (Mayk Brito) e evoluído por [@douglasabnovato](https://github.com/douglasabnovato).
