> **Projeto de estudo.** Estado conferido em 30/10/2026: 1 endereço(s) citado(s) abaixo não responde(m). Detalhes em [docs/AVALIACAO.md](docs/AVALIACAO.md) e próximos passos em [docs/PLANO-ESTRATEGICO.md](docs/PLANO-ESTRATEGICO.md).

<h1 align="center">Casa Criativa</h1>

<p align="center">Catálogo colaborativo de ideias de atividades para fazer em casa.</p>

<p align="center"><img alt="Casa Criativa" src="./public/img/casa-criativa-1.jpg" width="720"></p>

## Problema e proposta

Quem passa longos períodos em casa procura o que fazer. A Casa Criativa reúne ideias (cursos, brincadeiras, filmes, livros) cadastradas pela própria comunidade.

- **Público:** famílias e estudantes em casa.
- **Métrica de sucesso:** ideias cadastradas por semana (`GET /health` mostra o total).

## Funcionalidades

- Home com as 2 ideias mais recentes e lista completa em `/ideias`.
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
npm test               # 8 testes
```

Para reaproveitar as ideias do banco antigo, use `DATABASE_FILE=./ws.db` na primeira execução: a migration converte a tabela e descarta linhas inválidas.

## Em produção

- **URL:** https://casa-criativa.onrender.com (Render, web service gratuito, blueprint `render.yaml`, deploy automático a cada push na `master`).
- GitHub Pages não serve aqui: o projeto tem servidor Express e banco SQLite, e o Pages só publica arquivos estáticos.
- O SQLite de produção fica em `/tmp/casa-criativa.sqlite`: as ideias cadastradas **somem a cada reinício ou deploy** e o banco volta às 2 ideias iniciais.
- Passo a passo completo: [docs/DEPLOY.md](docs/DEPLOY.md).

## Documentação

- [docs/ANALISE.md](docs/ANALISE.md) · [docs/ARQUITETURA.md](docs/ARQUITETURA.md) · [docs/PLANO-DE-ACAO.md](docs/PLANO-DE-ACAO.md) · [docs/DEPLOY.md](docs/DEPLOY.md)

Projeto iniciado no workshop Rocketseat (Mayk Brito) e evoluído por [@douglasabnovato](https://github.com/douglasabnovato).
