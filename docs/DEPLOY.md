# Deploy · Casa Criativa

Plano de ação para publicar o catálogo de ideias em hospedagem gratuita.

## 1. Desafio

Colocar no ar, sem custo, uma aplicação Express + Nunjucks + SQLite (better-sqlite3) que recebe cadastros públicos de ideias, mantendo a proteção contra spam (limite de envios por IP) e deixando claro que o banco do plano gratuito é temporário.

## 2. Conteúdo

### Decisão de hospedagem

| Opção | Resultado |
|---|---|
| **Render, 1 web service gratuito (escolhida)** | Roda o servidor Express; blueprint `render.yaml` já no repositório; deploy automático a cada push |
| GitHub Pages | Não serve: só publica arquivos estáticos, e o projeto precisa de servidor Express e banco |
| Netlify (antiga `.netlify/`) | Não executa servidor Express contínuo; por isso `.netlify/state.json` sai do repositório |
| VPS ou disco persistente pago | Fora da regra do portfólio (só hospedagem gratuita) |

### O que foi ajustado para produção

| Mudança | Arquivo | Por quê |
|---|---|---|
| `NODE_VERSION` `22` | `render.yaml` | O Node 20 saiu de suporte em abr/2026 |
| `autoDeployTrigger: commit` | `render.yaml` | Cada push na `master` publica sozinho |
| `NODE_ENV=production` | `render.yaml` | Liga o cache de templates do Nunjucks e o `npm ci` deixa de instalar dependências de teste |
| `DATABASE_FILE=/tmp/casa-criativa.sqlite` | `render.yaml` | Caminho gravável e explícito para o SQLite no Render |
| `TRUST_PROXY=1` (já existia) | `render.yaml` | Sem isso o limite de 10 envios/min contaria todos os visitantes como um só IP (o do proxy do Render) |
| CI com Node 22 | `ci/github-actions-ci.yml` → mover para `.github/workflows/ci.yml` | Testes e `npm audit` a cada push, na mesma versão da produção |
| `ws.db*` no `.gitignore` | `.gitignore` | Depois do `git rm --cached ws.db`, o `git add -A` não volta a versionar o banco |
| Seção "Em produção" | `Readme.md` | URL, hospedagem e aviso de dados temporários |

### Limitações do plano gratuito

- **Os dados somem a cada reinício ou deploy**: o disco do Render Free é temporário. O banco volta às 2 ideias iniciais (seed) sempre que o serviço reinicia, dorme e acorda em outra máquina, ou recebe um novo deploy. Para persistir, o caminho gratuito seria migrar para PostgreSQL (Neon), o que é mudança de arquitetura (decisão pendente).
- O serviço dorme após 15 min sem acesso e leva cerca de 1 min para acordar.
- As 750 horas gratuitas por mês são da conta inteira do Render, somando todos os serviços.

### Pontos de atenção (segurança e LGPD)

- O cadastro é público e sem login: qualquer pessoa pode publicar uma ideia. Há validação, links só `http(s)`, conteúdo escapado e limite de 10 envios por minuto por IP, mas não há moderação.
- O formulário não pede dados pessoais (título, categoria, imagem, descrição e link). Mesmo assim, as imagens são URLs externas: o navegador do visitante carrega imagens de terceiros.
- `ws.db` tem 2 ideias antigas; não versione bancos (é o objetivo do `git rm --cached`).

## 3. Solução (passo a passo)

Branch principal: **`master`**.

### Etapa 1 · Validar localmente (Git Bash)

1. `cd /c/ambiente-projeto/ser-mvp/casa-criativa`
2. Apagar os arquivos substituídos (eles saem do Git e do disco):
   `git rm db.js server.js views/allIdeas.html yarn.lock .netlify/state.json`
3. Opcional, recomendado: parar de versionar o banco antigo (o arquivo continua no seu disco):
   `git rm --cached ws.db`
4. `npm install` (gera o `node_modules` a partir do `package-lock.json` novo)
5. `npm test` (esperado: 8 testes passando)
6. Opcional, para migrar as 2 ideias antigas para o banco local novo: `DATABASE_FILE=./ws.db npm start` uma vez, depois `Ctrl+C`.
7. Simular produção: `PORT=3000 NODE_ENV=production TRUST_PROXY=1 DATABASE_FILE=./data/producao-local.sqlite npm start` (no Render o arquivo fica em `/tmp`; aqui vai para `data/`, que o Git ignora) e abrir `http://localhost:3000/health` (esperado: `{"status":"ok","ideas":2}`). `Ctrl+C` para sair.

### Etapa 2 · Subir para o GitHub

1. Ativar o CI (a pasta `.github` é protegida para a ferramenta que preparou o projeto, então o arquivo veio em `ci/`):
   `mkdir -p .github/workflows && mv ci/github-actions-ci.yml .github/workflows/ci.yml && rmdir ci`
2. `git status` (não podem aparecer `node_modules/`, `data/`, `.env` nem `ws.db` como arquivo novo)
3. `git add -A`
4. `git commit -m "feat(deploy): Node 22, SQLite em /tmp, deploy automático no Render e CI"`
5. `git push origin master`
6. No GitHub, aba **Actions**: o CI precisa ficar verde.

### Etapa 3 · Criar o serviço no Render

1. Entrar em **render.com** com a conta do GitHub e autorizar o repositório `casa-criativa`.
2. **New → Blueprint** e escolher `douglasabnovato/casa-criativa` (branch `master`).
3. Conferir o serviço `casa-criativa`, plano **Free**, e as variáveis já preenchidas pelo blueprint: `NODE_VERSION=22`, `NODE_ENV=production`, `TRUST_PROXY=1`, `DATABASE_FILE=/tmp/casa-criativa.sqlite`. Nenhum segredo é pedido.
4. **Apply** e acompanhar **Logs** até aparecer `Casa Criativa em http://localhost:10000` (3 a 6 min; o `better-sqlite3` compila na primeira vez).

### Etapa 4 · Conferir no ar

1. `https://casa-criativa.onrender.com/health` responde `{"status":"ok","ideas":2}`.
2. A home mostra as 2 ideias iniciais e o logo carrega.
3. `/ideias` lista as ideias; cadastrar uma ideia de teste redireciona para `/ideias?criada=1` e o total em `/health` sobe para 3.
4. Enviar o formulário vazio mostra os erros por campo.
5. Uma URL inexistente (ex.: `/xyz`) mostra a página 404 própria.
6. Em **Manual Deploy → Restart service**, `/health` volta a `ideas: 2` (confirma o comportamento de disco temporário).

### Etapa 5 · Fechar

1. Se a URL real for diferente de `https://casa-criativa.onrender.com`, corrigir no `Readme.md`, commit e push (o Render publica sozinho).
2. No GitHub, **About → Website**: colar a URL.
