/* Aplicação Express da Casa Criativa: rotas, views Nunjucks, segurança e tratamento de erros */
const path = require("path");
const express = require("express");
const nunjucks = require("nunjucks");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { validateIdea } = require("./lib/ideaValidation");

const LIST_LIMIT = 100;

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
    res.render("ideias.html", { ideas: ideas.latest(LIST_LIMIT), created: req.query.criada === "1" });
  });

  app.post(["/", "/ideias"], postLimiter, (req, res) => {
    const { value, errors } = validateIdea(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(422).render("ideias.html", {
        ideas: ideas.latest(LIST_LIMIT),
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
