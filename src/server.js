/* Ponto de entrada: abre o banco e sobe o servidor HTTP */
const config = require("./config");
const { openDatabase } = require("./db/connection");
const { createIdeaRepository } = require("./ideaRepository");
const { createApp } = require("./app");

/* Inicializa dependências e escuta na porta configurada */
function main() {
  const db = openDatabase(config.databaseFile);
  const app = createApp({ ideas: createIdeaRepository(db), trustProxy: config.trustProxy });
  app.listen(config.port, () => console.log(`Casa Criativa em http://localhost:${config.port}`));
}

main();
/* Fim de server.js */
