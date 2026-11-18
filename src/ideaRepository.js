/* Acesso aos dados de ideias (consultas preparadas) */

/* Cria o repositório sobre uma conexão better-sqlite3 */
function createIdeaRepository(db) {
  /* Minúsculas em português (o lower() do SQLite só trata ASCII) e sem acentos, para a busca por texto (#50, #62) */
  db.function("dobra", { deterministic: true }, (texto) =>
    texto == null ? "" : String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR")
  );
  const latest = db.prepare("SELECT * FROM ideas ORDER BY created_at DESC, id DESC LIMIT ?");
  const insert = db.prepare(
    "INSERT INTO ideas(title, category, image, description, link) VALUES (@title, @category, @image, @description, @link)"
  );
  const count = db.prepare("SELECT count(*) AS total FROM ideas");
  const categories = db.prepare(
    "SELECT category AS name, count(*) AS total FROM ideas GROUP BY category COLLATE NOCASE ORDER BY category COLLATE NOCASE"
  );
  /* Filtro da lista (#50, #60): texto vazio ou categoria vazia não filtram.
     instr() procura o texto literal: % e _ não viram curingas, como no LIKE */
  const filtro = `(@texto = '' OR instr(dobra(title), dobra(@texto)) > 0 OR instr(dobra(description), dobra(@texto)) > 0)
       AND (@categoria = '' OR category = @categoria COLLATE NOCASE)`;
  const page = db.prepare(
    `SELECT * FROM ideas WHERE ${filtro} ORDER BY created_at DESC, id DESC LIMIT @limite OFFSET @inicio`
  );
  const total = db.prepare(`SELECT count(*) AS total FROM ideas WHERE ${filtro}`);
  const params = ({ texto, categoria }) => ({ texto: texto || "", categoria: categoria || "" });
  return {
    latest: (limit) => latest.all(limit),
    /* Uma página da lista filtrada, das mais novas para as mais antigas (#60) */
    page: ({ texto, categoria, limit, offset }) => page.all({ ...params({ texto, categoria }), limite: limit, inicio: offset }),
    total: ({ texto, categoria }) => total.get(params({ texto, categoria })).total,
    categories: () => categories.all(),
    create: (idea) => insert.run(idea).lastInsertRowid,
    count: () => count.get().total,
  };
}

module.exports = { createIdeaRepository };
/* Fim de ideaRepository.js */
