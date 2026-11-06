/* Acesso aos dados de ideias (consultas preparadas) */

/* Cria o repositório sobre uma conexão better-sqlite3 */
function createIdeaRepository(db) {
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
  return {
    latest: (limit) => latest.all(limit),
    byCategory: (category, limit) => byCategory.all(category, limit),
    categories: () => categories.all(),
    create: (idea) => insert.run(idea).lastInsertRowid,
    count: () => count.get().total,
  };
}

module.exports = { createIdeaRepository };
/* Fim de ideaRepository.js */
