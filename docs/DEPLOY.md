# Deploy · Casa Criativa

Como publicar o catálogo de ideias em hospedagem gratuita. Revisto em 16/11/2026.

**Estado em 16/11/2026:** fora do ar. `curl -s -o /dev/null -m 60 -w "%{http_code}" https://casa-criativa.onrender.com/health` devolveu `000` (sem resposta em 60 s). Criar ou religar o serviço é do responsável (#47). Em N1 a publicação não é obrigatória.

## 1. Decisão de hospedagem

| Opção | Resultado |
|---|---|
| **Render, 1 web service gratuito (escolhida)** | Roda o servidor Express; Blueprint `render.yaml` no repositório; deploy automático a cada commit na `master` |
| GitHub Pages | Não serve: só publica arquivos estáticos, e o projeto precisa de servidor Express e banco |
| Netlify | Não executa servidor Express contínuo. O `.netlify/state.json` antigo saiu do repositório em 16/11/2026 |
| Vercel | Funções serverless sem disco: o SQLite não teria onde gravar |
| VPS ou disco persistente pago | Fora da regra do portfólio (só hospedagem gratuita) |

## 2. O que o `render.yaml` já define

| Chave | Valor | Por quê |
|---|---|---|
| `plan` | `free` | Só hospedagem gratuita |
| `buildCommand` | `npm ci` | Instala pelo `package-lock.json`; com `NODE_ENV=production`, sem as dependências de teste |
| `startCommand` | `npm start` | `node src/server.js` |
| `healthCheckPath` | `/health` | O Render só troca a versão quando `/health` responde |
| `autoDeployTrigger` | `commit` | Cada merge na `master` publica sozinho |
| `NODE_VERSION` | `22` | A mesma versão do job `raiz` do CI (o CI também testa no Node 24) |
| `NODE_ENV` | `production` | Liga o cache de templates do Nunjucks |
| `TRUST_PROXY` | `1` | Sem isso, o limite de 10 envios por minuto contaria todos os visitantes como um só IP (o do proxy do Render) |
| `DATABASE_FILE` | `/tmp/casa-criativa.sqlite` | Caminho gravável no plano gratuito |

Nenhum segredo é pedido: o app não usa chave de serviço externo nem banco remoto.

## 3. Limites do plano gratuito

- **Os dados somem a cada reinício ou deploy**: o disco do Render Free é temporário. O banco volta às 2 ideias iniciais sempre que o serviço reinicia, dorme e acorda em outra máquina, ou recebe um deploy. Banco persistente é mudança de arquitetura e fica fora do MVP.
- O serviço dorme após 15 min sem acesso e leva cerca de 1 min para acordar.
- As 750 horas gratuitas por mês são da conta inteira do Render, somando todos os serviços.

## 4. Segurança e LGPD

- O cadastro é público e sem login. Há validação, links só `http(s)`, conteúdo escapado, CSP do `helmet` e limite de 10 envios por minuto por IP. Não há moderação (fora do MVP).
- O formulário não pede dado pessoal: título, categoria, imagem, descrição e link.
- As imagens são URLs externas: o navegador de quem visita carrega imagens de terceiros, com `referrerpolicy="no-referrer"`.

## 5. Passo a passo (responsável)

### Etapa 1 · Conferir localmente (opcional)

1. `git clone https://github.com/douglasabnovato/casa-criativa && cd casa-criativa`
2. `npm ci` (Node 22 ou 24)
3. `npm test` (esperado: 17 testes passando)
4. Simular produção: `PORT=3000 NODE_ENV=production TRUST_PROXY=1 DATABASE_FILE=./data/producao-local.sqlite npm start`.
5. Abrir `http://localhost:3000/health`. Esperado: `{"status":"ok","ideas":2}`. `Ctrl+C` para sair.

### Etapa 2 · Conferir a `master`

1. O código chega à `master` só por PR (a `master` é protegida). Abrir **Actions** e conferir que o último run do workflow **CI** na `master` está verde.

### Etapa 3 · Criar o serviço no Render

1. Entrar em [dashboard.render.com](https://dashboard.render.com) com a conta do GitHub.
2. Se o serviço `casa-criativa` antigo aparecer na lista, abrir e conferir **Events**: se estiver suspenso, clicar em **Resume Service** e pular para a Etapa 4.
3. Senão: **New +** → **Blueprint**.
4. Em **Connect a repository**, escolher `douglasabnovato/casa-criativa`. Se ele não aparecer, clicar em **Configure account** e liberar o repositório no GitHub.
5. **Blueprint Name:** `casa-criativa`. **Branch:** `master`.
6. Conferir na prévia: 1 web service `casa-criativa`, plano **Free**, e as 4 variáveis da seção 2. Nenhum campo de segredo aparece.
7. Clicar em **Deploy Blueprint**.
8. Abrir o serviço → **Logs** e esperar `Casa Criativa em http://localhost:10000` (3 a 6 min).

### Etapa 4 · Conferir no ar

1. Copiar a URL no topo da página do serviço. **Atenção:** o Render pode acrescentar um sufixo (ex.: `casa-criativa-ab12.onrender.com`) quando o nome já existe em outra conta. Usar a URL que o painel mostra.
2. `curl -s -o /dev/null -w "%{http_code}" <URL>/health` devolve `200`, e `<URL>/health` mostra `{"status":"ok","ideas":2}`.
3. A home mostra as 2 ideias iniciais e o logo.
4. `/ideias?q=programação` mostra só "Fundamentos de Programação".
5. Cadastrar uma ideia de teste: a página vai para `/ideias?criada=1`, e `/health` mostra `ideas: 3`.
6. Uma URL inexistente (ex.: `/xyz`) mostra a página 404 própria.

### Etapa 5 · Registrar

1. Comentar na issue #47 a URL e o resultado do `curl` da Etapa 4.
2. Se a URL for diferente de `https://casa-criativa.onrender.com`, avisar na issue: o agente do próximo ciclo corrige README e `docs/MVP.md` por PR.
3. No GitHub, **About** (engrenagem ao lado do nome do repositório) → **Website**: colar a URL.

### Se decidir não publicar

Comentar na #47 "fica só local" e fechar a issue. O README já diz como rodar localmente.
