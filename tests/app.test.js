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
/* Fim de app.test.js */
