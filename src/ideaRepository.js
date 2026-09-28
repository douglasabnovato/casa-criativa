/* Acesso aos dados de ideias (consultas preparadas) */

/* Cria o repositório sobre uma conexão better-sqlite3 */
function createIdeaRepository(db) {
  const latest = db.prepare("SELECT * FROM ideas ORDER BY created_at DESC, id DESC LIMIT ?");
  const insert = db.prepare(
    "INSERT INTO ideas(title, category, image, description, link) VALUES (@title, @category, @image, @description, @link)"
  );
  const count = db.prepare("SELECT count(*) AS total FROM ideas");
  return {
    latest: (limit) => latest.all(limit),
    create: (idea) => insert.run(idea).lastInsertRowid,
    count: () => count.get().total,
  };
}

module.exports = { createIdeaRepository };
/* Fim de ideaRepository.js */
