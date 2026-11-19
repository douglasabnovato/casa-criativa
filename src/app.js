/* Aplicação Express da Casa Criativa: rotas, views Nunjucks, segurança e tratamento de erros */
const path = require("path");
const express = require("express");
const nunjucks = require("nunjucks");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { validateIdea } = require("./lib/ideaValidation");

/* Ideias por página em /ideias (#60) */
const PAGE_SIZE = 20;

/* Lê ?pagina=N: inteiro de 1 em diante; o resto vira 1 */
function parsePage(value) {
  const n = typeof value === "string" && /^\d{1,6}$/.test(value) ? Number(value) : 1;
  return n >= 1 ? n : 1;
}

/* Monta o href de /ideias guardando a busca, a categoria e a página */
function listHref({ q, categoria, pagina }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (categoria) params.set("categoria", categoria);
  if (pagina > 1) params.set("pagina", String(pagina));
  const query = params.toString();
  return query ? `/ideias?${query}` : "/ideias";
}

/* Busca uma página da lista; página acima da última mostra a última (#60) */
function listPage(ideas, { q = "", categoria = "", pagina = 1 } = {}) {
  const total = ideas.total({ texto: q, categoria });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(pagina, pages);
  const list = ideas.page({ texto: q, categoria, limit: PAGE_SIZE, offset: (current - 1) * PAGE_SIZE });
  return {
    ideas: list,
    pagination: {
      current,
      pages,
      prev: current > 1 ? listHref({ q, categoria, pagina: current - 1 }) : null,
      next: current < pages ? listHref({ q, categoria, pagina: current + 1 }) : null,
    },
  };
}

/* Monta o app recebendo o repositório por injeção de dependência */
function createApp({ ideas, trustProxy = false }) {
  const app = express();
  if (trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "https:", "http:", "data:"],
          "style-src": ["'self'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com"],
          "script-src": ["'self'"],
        },
      },
    })
  );
  app.use(express.static(path.join(__dirname, "..", "public"), { maxAge: "1h" }));
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));

  nunjucks.configure(path.join(__dirname, "..", "views"), { express: app, autoescape: true, noCache: process.env.NODE_ENV !== "production" });

  const postLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: "draft-7", legacyHeaders: false });

  app.get("/health", (req, res) => res.json({ status: "ok", ideas: ideas.count() }));

  app.get("/", (req, res) => {
    res.render("index.html", { ideas: ideas.latest(2), created: req.query.criada === "1" });
  });

  app.get("/ideias", (req, res) => {
    const raw = typeof req.query.categoria === "string" ? req.query.categoria.trim().slice(0, 40) : "";
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 80) : "";
    res.render("ideias.html", {
      ...listPage(ideas, { q, categoria: raw, pagina: parsePage(req.query.pagina) }),
      categories: ideas.categories(),
      selected: raw,
      q,
      created: req.query.criada === "1",
    });
  });

  app.post(["/", "/ideias"], postLimiter, (req, res) => {
    const { value, errors } = validateIdea(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(422).render("ideias.html", {
        ...listPage(ideas),
        categories: ideas.categories(),
        form: value,
        errors,
        openModal: true,
      });
    }
    ideas.create(value);
    return res.redirect(303, "/ideias?criada=1");
  });

  app.use((req, res) => res.status(404).render("error.html", { status: 404, message: "Página não encontrada." }));

  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    return res.status(500).render("error.html", { status: 500, message: "Não foi possível concluir agora. Tente novamente em instantes." });
  });

  return app;
}

module.exports = { createApp };
/* Fim de app.js */
