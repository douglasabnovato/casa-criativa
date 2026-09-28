# Análise — Casa Criativa

## 1. Especificação

Catálogo colaborativo de ideias de atividades para fazer em casa (brincadeiras, cursos, filmes, livros). Qualquer visitante vê as ideias e cadastra uma nova com título, categoria, imagem, descrição e link.

| Ator | Objetivo |
|---|---|
| Visitante | Encontrar uma atividade para fazer em casa |
| Contribuidor | Publicar uma ideia útil para outras pessoas |

### Requisitos funcionais

| ID | Requisito | Critério de aceite (Gherkin resumido) | Antes |
|---|---|---|---|
| RF01 | Ver as 2 ideias mais recentes na home | Dado 3 ideias, quando abro `/`, então vejo as 2 últimas | ⚠️ funciona só no Windows (D1) |
| RF02 | Listar todas as ideias | Quando abro `/ideias`, vejo da mais nova para a mais antiga | ⚠️ D1 |
| RF03 | Cadastrar ideia | Dado campos válidos, quando salvo, sou levado à lista com confirmação | ⚠️ sem confirmação |
| RF04 | Recusar dados inválidos | Dado link sem `http(s)`, quando salvo, vejo o erro no campo | ❌ D2, D4 |
| RF05 | Funcionar com banco novo | Dado banco vazio, quando subo o servidor, a tabela é criada | ❌ D3 |

### Requisitos não funcionais

| ID | Requisito | Referência |
|---|---|---|
| RNF01 | Sem XSS armazenado | OWASP A05:2025 (Injection) |
| RNF02 | Acessível por teclado e leitor de tela | WCAG 2.2 AA |
| RNF03 | Configuração por ambiente | 12-Factor III |
| RNF04 | Hospedagem gratuita | Render (Web Service Free) |

## 2. Defeitos encontrados

| # | Severidade | Onde | Defeito |
|---|---|---|---|
| D1 | Crítica | `views/*.html` | `{% include "allideas.html" %}` referencia `allIdeas.html`: no Linux (qualquer hospedagem) a página quebra |
| D2 | Alta | `modal.html` | `onsubmit="return checkFields(e)"` — `e` não existe, a validação nunca roda |
| D3 | Alta | `db.js` | `CREATE TABLE` comentado: banco novo gera erro em todas as rotas |
| D4 | Alta | `server.js` | Nenhuma validação no servidor; link `javascript:` vira XSS ao clicar |
| D5 | Média | `package.json` | Pacotes sem uso (`and`, `global`, `name`), `netlify-cli`/`nodemon` em produção, script `build` do React inexistente |
| D6 | Média | `views` | Rótulos sem `for`, modal sem `role="dialog"`, contraste 3,0:1 |
| D7 | Baixa | `server.js` | Carrega todas as ideias para exibir 2; porta fixa 3000 |
| D8 | Baixa | repositório | `ws.db` (dados) e `.netlify/state.json` versionados |

## Rubrica v2 (grupo fullstack)

Aprovação: média ponderada ≥ 7,0 **e** C1 e C4 (eliminatórios) ≥ 5. Regras: nota sem evidência vale no máximo 6; C1 limitado a 7 para parte não executada de ponta a ponta; C9 ≥ 8 só com URL publicada e CI verde.

| # | Critério | Referência | Peso | Antes | Depois | Evidência | Justificativa |
|---|---|---|---|---|---|---|---|
| C1 | Núcleo de valor | MVP (Ries); SWEBOK Requirements | 16% | 4 | 8 | Teste `home mostra 2 últimas`, `POST válido` + navegação Playwright | Antes: `include "allideas.html"` quebra no Linux (arquivo é `allIdeas.html`) e banco novo não tem tabela |
| C2 | Estados e condições excepcionais | Nielsen; OWASP A10:2025 | 8% | 2 | 8 | Testes 422/404; páginas de erro | Antes: erro vira texto "Erro no db"; validação usa `alert()` |
| C3 | Acessibilidade | WCAG 2.2 AA (axe-core) | 7% | 3 | 8 | axe-core: 0 violações em / e /ideias (com modal aberto) | Rótulos sem `for`, `nav` sem lista, modal sem papel de diálogo, contraste 3,0:1 |
| C4 | Segurança e privacidade | OWASP Top 10:2025 / ASVS 5.0 N1 | 14% | 3 | 8 | Teste XSS e `javascript:`; helmet CSP; rate limit | Link `javascript:` era aceito e renderizado (XSS armazenado) |
| C5 | Dados | 3FN / ACID / fonte única | 10% | 3 | 8 | Teste de migração do banco legado; CHECKs no schema | Tabela sem restrições; banco de dados versionado |
| C6 | Testes | Pirâmide de testes; SWEBOK Testing | 9% | 0 | 8 | 8 testes `node --test` + supertest | Nenhum teste |
| C7 | Qualidade de código | SOLID / camadas; SWEBOK Construction | 7% | 3 | 8 | Revisão: camadas config/db/repo/app | SQL e regra misturados em `server.js`; código comentado |
| C8 | Desempenho | Complexidade; Core Web Vitals | 5% | 5 | 7 | Consulta `LIMIT 2` com índice; imagens `lazy` | Carregava todas as ideias para exibir 2 |
| C9 | Operação | 12-Factor; DORA | 7% | 2 | 7 | `npm start`, `PORT`, `/health`; sem deploy | Porta fixa; `netlify-cli` e `nodemon` em produção; Netlify não roda Express |
| C10 | Documentação | README como contrato | 5% | 4 | 8 | README + docs/ | README é diário de aula |
| C11 | Produto e evidência | Cagan (4 riscos); Torres | 7% | 3 | 6 | `/health` expõe total de ideias (métrica) | Proposta clara, sem métrica de uso |
| C12 | Sustentabilidade técnica | OWASP A03:2025; SWEBOK Maintenance | 5% | 2 | 8 | `npm audit`: 0 vulnerabilidades (antes 114, 8 críticas) | Pacotes sem uso (`and`, `global`, `name`), `sqlite3` nativo, 114 vulnerabilidades |

**Média ponderada:** antes **2,84** (REPROVADO) → depois **7,74** (APROVADO).

