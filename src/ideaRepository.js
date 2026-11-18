/* Acesso aos dados de ideias (consultas preparadas) */

/* Cria o repositório sobre uma conexão better-sqlite3 */
function createIdeaRepository(db) {
  /* Minúsculas em português (o lower() do SQLite só trata ASCII) e sem acentos, para a busca por texto (#50, #62) */
  db.function("dobra", { deterministic: true }, (texto) =>
    texto == null ? "" : String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR")
  );
  const latest = db.prepare("SELECT * FROM ideas ORDER BY created_at DESC, id DESC LIMIT ?");
  const insert = db.prepare(
    "INSERT INTO ideas(title, category, image, description, link) VALUES (@title, @category, @image, @description, @link)"
  );
  const count = db.prepare("SELECT count(*) AS total FROM ideas");
  const byCategory = db.prepare(
    "SELECT * FROM ideas WHERE category = ? COLLATE NOCASE ORDER BY created_at DESC, id DESC LIMIT ?"
  );
  const categories = db.prepare(
    "SELECT category AS name, count(*) AS total FROM ideas GROUP BY category COLLATE NOCASE ORDER BY category COLLATE NOCASE"
  );
  /* instr() procura o texto literal: % e _ não viram curingas, como no LIKE */
  const search = db.prepare(
    `SELECT * FROM ideas
     WHERE (instr(dobra(title), dobra(@texto)) > 0 OR instr(dobra(description), dobra(@texto)) > 0)
       AND (@categoria = '' OR category = @categoria COLLATE NOCASE)
     ORDER BY created_at DESC, id DESC LIMIT @limite`
  );
  return {
    latest: (limit) => latest.all(limit),
    search: (texto, categoria, limit) => search.all({ texto, categoria: categoria || "", limite: limit }),
    byCategory: (category, limit) => byCategory.all(category, limit),
    categories: () => categories.all(),
    create: (idea) => insert.run(idea).lastInsertRowid,
    count: () => count.get().total,
  };
}

module.exports = { createIdeaRepository };
/* Fim de ideaRepository.js */
