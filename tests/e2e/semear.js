/* Prepara o banco dos testes de interface: seed normal e 25 ideias antigas, para a lista ter 2 páginas (#60) */
const { openDatabase } = require("../../src/db/connection");

const file = process.env.DATABASE_FILE;
if (!file) throw new Error("DATABASE_FILE não definido");

const db = openDatabase(file);
/* Datas antigas: as ideias do seed e as criadas nos testes continuam na página 1 */
const insert = db.prepare(
  `INSERT INTO ideas(title, category, image, description, link, created_at)
   VALUES (@title, 'Arquivo', 'https://example.com/arquivo.png', 'Ideia antiga para testar a paginação da lista.', 'https://example.com/arquivo', @created_at)`
);
db.transaction(() => {
  for (let i = 1; i <= 25; i++) {
    const n = String(i).padStart(2, "0");
    insert.run({ title: `Ideia antiga ${n}`, created_at: `2020-01-${n} 12:00:00` });
  }
})();
db.close();
/* Fim de semear.js */
