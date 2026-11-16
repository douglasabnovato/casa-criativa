/* Testes de integração da Casa Criativa com banco em memória */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { openDatabase } = require("../src/db/connection");
const { createIdeaRepository } = require("../src/ideaRepository");
const { createApp } = require("../src/app");
const { validateIdea } = require("../src/lib/ideaValidation");

/* Cria um app isolado com banco novo */
function buildApp() {
  const db = openDatabase(":memory:");
  const ideas = createIdeaRepository(db);
  return { app: createApp({ ideas }), ideas };
}

const valid = {
  title: "Clube do livro",
  category: "Leitura",
  image: "https://example.com/livro.png",
  description: "Ler um capítulo por dia e conversar com a família no jantar.",
  link: "https://example.com/clube",
};

test("validação recusa URL javascript: e campos curtos", () => {
  const { errors } = validateIdea({ ...valid, link: "javascript:alert(1)", title: "a" });
  assert.ok(errors.link);
  assert.ok(errors.title);
  assert.deepEqual(validateIdea(valid).errors, {});
});

test("banco novo cria tabela e semeia 2 ideias", () => {
  const { ideas } = buildApp();
  assert.equal(ideas.count(), 2);
});

test("home mostra no máximo as 2 últimas ideias", async () => {
  const { app, ideas } = buildApp();
  ideas.create({ ...valid, title: "Terceira ideia" });
  const res = await request(app).get("/").expect(200);
  assert.match(res.text, /Terceira ideia/);
  assert.equal((res.text.match(/<article class="idea">/g) || []).length, 2);
});

test("POST válido grava e redireciona com 303 (PRG)", async () => {
  const { app, ideas } = buildApp();
  const res = await request(app).post("/ideias").type("form").send(valid).expect(303);
  assert.equal(res.headers.location, "/ideias?criada=1");
  assert.equal(ideas.count(), 3);
  const list = await request(app).get("/ideias?criada=1").expect(200);
  assert.match(list.text, /Ideia cadastrada/);
});

test("POST inválido responde 422 com erros por campo e não grava", async () => {
  const { app, ideas } = buildApp();
  const res = await request(app).post("/").type("form").send({ ...valid, link: "javascript:alert(1)" }).expect(422);
  assert.match(res.text, /aria-invalid="true"/);
  assert.equal(ideas.count(), 2);
});

test("conteúdo é escapado (sem XSS armazenado)", async () => {
  const { app, ideas } = buildApp();
  ideas.create({ ...valid, title: "<script>x</script>" });
  const res = await request(app).get("/ideias").expect(200);
  assert.doesNotMatch(res.text, /<script>x<\/script>/);
});

test("rota inexistente responde 404 e /health responde ok", async () => {
  const { app } = buildApp();
  await request(app).get("/nao-existe").expect(404);
  const res = await request(app).get("/health").expect(200);
  assert.equal(res.body.status, "ok");
});

test("migração preserva ideias válidas de banco legado", () => {
  const Database = require("better-sqlite3");
  const os = require("os");
  const path = require("path");
  const file = path.join(os.tmpdir(), `legado-${Date.now()}.sqlite`);
  const legacy = new Database(file);
  legacy.exec("CREATE TABLE ideas(id INTEGER PRIMARY KEY AUTOINCREMENT, image TEXT, title TEXT, category TEXT, description TEXT, link TEXT)");
  legacy.prepare("INSERT INTO ideas(image,title,category,description,link) VALUES (?,?,?,?,?)").run(valid.image, valid.title, valid.category, valid.description, valid.link);
  legacy.prepare("INSERT INTO ideas(image,title,category,description,link) VALUES (?,?,?,?,?)").run("x", "", "", "", "javascript:1");
  legacy.close();
  const db = openDatabase(file);
  const rows = createIdeaRepository(db).latest(10);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, valid.title);
});

test("filtro por categoria mostra só a categoria escolhida, com contagem", async () => {
  const { app, ideas } = buildApp();
  ideas.create(valid);
  ideas.create({ ...valid, title: "Roda de leitura" });
  const res = await request(app).get("/ideias?categoria=leitura").expect(200);
  assert.equal((res.text.match(/<article class="idea">/g) || []).length, 2);
  assert.match(res.text, /Leitura \(2\)/);
  assert.match(res.text, /aria-current="page">Leitura/);
  const vazio = await request(app).get("/ideias?categoria=Inexistente").expect(200);
  assert.match(vazio.text, /Nenhuma ideia nesta categoria/);
});

/* Conta os cards de ideia no HTML */
const cards = (html) => (html.match(/<article class="idea">/g) || []).length;

test("busca por texto acha no título e na descrição, sem diferenciar maiúsculas (#50)", async () => {
  const { app, ideas } = buildApp();
  ideas.create({ ...valid, title: "Clube do livro" });
  ideas.create({ ...valid, title: "Roda de conversa", description: "Contar histórias do LIVRO favorito em família." });
  ideas.create({ ...valid, title: "Ioga na sala", category: "Saúde", description: "Alongar o corpo ao som de música calma." });
  const res = await request(app).get("/ideias?q=livro").expect(200);
  assert.equal(cards(res.text), 2);
  assert.match(res.text, /Clube do livro/);
  assert.match(res.text, /Roda de conversa/);
  assert.doesNotMatch(res.text, /Ioga na sala/);
  assert.match(res.text, /value="livro"/);
  /* Maiúsculas acentuadas também (o lower() do SQLite só trata ASCII) */
  const acento = await request(app).get("/ideias?q=" + encodeURIComponent("MÚSICA")).expect(200);
  assert.match(acento.text, /Ioga na sala/);
  const saude = await request(app).get("/ideias?q=" + encodeURIComponent("SAÚDE")).expect(200);
  assert.equal(cards(saude.text), 0, "a busca não olha a categoria");
});

test("busca sem resultado mostra aviso e link para ver todas (#50)", async () => {
  const { app } = buildApp();
  const res = await request(app).get("/ideias?q=xadrez").expect(200);
  assert.equal(cards(res.text), 0);
  assert.match(res.text, /Nenhuma ideia encontrada para “xadrez”/);
  assert.match(res.text, /<a href="\/ideias">Ver todas<\/a>/);
});

test("busca trata % e _ como texto, não como curinga (#50)", async () => {
  const { app, ideas } = buildApp();
  ideas.create({ ...valid, title: "Desconto de 50% no museu", description: "Visita virtual com 50% de desconto." });
  ideas.create({ ...valid, title: "Jogo da_velha", description: "Montar um tabuleiro com papel e caneta." });
  const pct = await request(app).get("/ideias?q=" + encodeURIComponent("%")).expect(200);
  assert.equal(cards(pct.text), 1);
  assert.match(pct.text, /Desconto de 50% no museu/);
  const sub = await request(app).get("/ideias?q=" + encodeURIComponent("_")).expect(200);
  assert.equal(cards(sub.text), 1);
  assert.match(sub.text, /Jogo da_velha/);
});

test("busca combina com o filtro de categoria e o filtro guarda a busca (#50)", async () => {
  const { app, ideas } = buildApp();
  ideas.create({ ...valid, title: "Ler poemas", category: "Leitura" });
  ideas.create({ ...valid, title: "Ler receitas", category: "Cozinha" });
  const res = await request(app).get("/ideias?q=ler&categoria=cozinha").expect(200);
  assert.equal(cards(res.text), 1);
  assert.match(res.text, /Ler receitas/);
  assert.match(res.text, /name="categoria" value="cozinha"/);
  assert.match(res.text, /href="\/ideias\?categoria=Leitura&amp;q=ler"/);
  const vazio = await request(app).get("/ideias?q=poemas&categoria=Cozinha").expect(200);
  assert.match(vazio.text, /Nenhuma ideia encontrada para “poemas” na categoria Cozinha/);
});

test("busca só com espaços mostra a lista completa (#50)", async () => {
  const { app } = buildApp();
  const res = await request(app).get("/ideias?q=%20%20").expect(200);
  assert.equal(cards(res.text), 2);
  assert.match(res.text, /Todas as ideias/);
});

test("lista de ideias segue a ordem de títulos h1, h2, h3", async () => {
  const { app } = buildApp();
  const res = await request(app).get("/ideias").expect(200);
  const corpo = res.text.replace(/<div id="modal"[\s\S]*$/, "");
  const niveis = [...corpo.matchAll(/<h([1-6])/g)].map((m) => Number(m[1]));
  niveis.forEach((n, i) => assert.ok(i === 0 || n - niveis[i - 1] <= 1, `salto de h${niveis[i - 1]} para h${n}`));
  assert.match(res.text, /<main id="conteudo">\s*<section id="title">/);
});

test("home marca cabeçalho e rodapé como landmarks", async () => {
  const { app } = buildApp();
  const res = await request(app).get("/").expect(200);
  assert.match(res.text, /<header role="banner">/);
  assert.match(res.text, /role="contentinfo"/);
});

test("falha no banco responde 500 com a página de erro", async () => {
  const quebrado = { latest: () => { throw new Error("banco fora"); }, count: () => 0, categories: () => [] };
  const app = createApp({ ideas: quebrado });
  const original = console.error;
  console.error = () => {};
  try {
    const res = await request(app).get("/").expect(500);
    assert.match(res.text, /Não foi possível concluir agora/);
    assert.match(res.text, /Voltar ao início/);
  } finally {
    console.error = original;
  }
});
/* Fim de app.test.js */
