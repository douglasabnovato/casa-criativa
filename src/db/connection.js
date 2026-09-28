/* Abre o SQLite, aplica as migrations (PRAGMA user_version) e popula ideias iniciais quando o banco está vazio */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS ideas(
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     image TEXT,
     title TEXT,
     category TEXT,
     description TEXT,
     link TEXT
   );`,
  `CREATE TABLE ideas_v2(
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     title TEXT NOT NULL CHECK(length(title) BETWEEN 3 AND 80),
     category TEXT NOT NULL CHECK(length(category) BETWEEN 2 AND 40),
     image TEXT NOT NULL,
     description TEXT NOT NULL CHECK(length(description) BETWEEN 10 AND 500),
     link TEXT NOT NULL,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   );
   INSERT INTO ideas_v2(id, title, category, image, description, link)
     SELECT id, trim(title), trim(category), image, trim(description), link FROM ideas
     WHERE length(trim(coalesce(title,''))) BETWEEN 3 AND 80
       AND length(trim(coalesce(category,''))) BETWEEN 2 AND 40
       AND length(trim(coalesce(description,''))) BETWEEN 10 AND 500
       AND image LIKE 'http%' AND link LIKE 'http%';
   DROP TABLE ideas;
   ALTER TABLE ideas_v2 RENAME TO ideas;
   CREATE INDEX idx_ideas_created ON ideas(created_at DESC, id DESC);`,
];

const SEED = [
  {
    title: "Fundamentos de Programação",
    category: "Estudo",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
    description: "Aprender lógica de programação com exercícios gratuitos e guiados.",
    link: "https://www.khanacademy.org/computing",
  },
  {
    title: "Exercícios em casa",
    category: "Saúde",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
    description: "Treinos curtos de 15 minutos que não precisam de equipamento.",
    link: "https://www.youtube.com/results?search_query=treino+em+casa+15+minutos",
  },
];

/* Cria a conexão, migra e popula; recebe o caminho do arquivo ou ":memory:" */
function openDatabase(file) {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  const current = db.pragma("user_version", { simple: true });
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
  const { total } = db.prepare("SELECT count(*) AS total FROM ideas").get();
  if (total === 0) {
    const insert = db.prepare(
      "INSERT INTO ideas(title, category, image, description, link) VALUES (@title, @category, @image, @description, @link)"
    );
    db.transaction(() => SEED.forEach((idea) => insert.run(idea)))();
  }
  return db;
}

module.exports = { openDatabase };
/* Fim de connection.js */
