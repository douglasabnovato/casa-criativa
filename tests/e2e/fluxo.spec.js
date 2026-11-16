/* Fluxo principal no navegador: abrir o modal, cadastrar e achar a ideia (#48) */
const { test, expect } = require("@playwright/test");

/* Sem rede externa (fontes, imagens de exemplo): o teste depende só do app local */
test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost[:/])/, (route) => route.abort());
});

/* Preenche os 5 campos do modal */
async function preencher(page, dados) {
  await page.getByLabel("Título da ideia", { exact: true }).fill(dados.title);
  await page.getByLabel("Categoria", { exact: true }).fill(dados.category);
  await page.getByLabel("Link da imagem (https://...)", { exact: true }).fill(dados.image);
  await page.getByLabel("Descrição da ideia", { exact: true }).fill(dados.description);
  await page.getByLabel("Link da ideia (https://...)", { exact: true }).fill(dados.link);
}

const base = {
  category: "Estudo",
  image: "https://example.com/livro.png",
  description: "Separar meia hora por dia para ler um livro novo.",
  link: "https://example.com/leitura",
};

test("cadastra uma ideia pelo modal e a encontra na lista e no filtro", async ({ page }, info) => {
  const title = `Ler em casa ${info.project.name}`;
  await page.goto("/");
  await page.getByRole("button", { name: "+ Adicionar ideia" }).click();
  const modal = page.getByRole("dialog", { name: "Nova ideia" });
  await expect(modal).toBeVisible();
  await expect(page.getByLabel("Título da ideia")).toBeFocused();
  await preencher(page, { ...base, title });
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL(/\/ideias\?criada=1$/);
  await expect(page.getByRole("status")).toHaveText(/Ideia cadastrada/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  /* O filtro só aparece com 2 categorias: cadastra uma segunda ideia, de outra categoria */
  const outra = `Bolo de caneca ${info.project.name}`;
  await page.getByRole("button", { name: "Nova ideia" }).click();
  await preencher(page, { ...base, title: outra, category: "Cozinha" });
  await page.getByRole("dialog").getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: outra })).toBeVisible();

  await page.getByRole("navigation", { name: "Filtrar por categoria" }).getByRole("link", { name: /^Estudo/ }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("heading", { name: outra })).toHaveCount(0);
});

test("link javascript: mostra o erro no campo, com foco nele, e não envia", async ({ page }) => {
  const posts = [];
  page.on("request", (req) => { if (req.method() === "POST") posts.push(req.url()); });
  await page.goto("/");
  await page.getByRole("button", { name: "+ Adicionar ideia" }).click();
  await preencher(page, { ...base, title: "Ideia com link ruim", link: "javascript:alert(1)" });
  await page.getByRole("dialog").getByRole("button", { name: "Salvar" }).click();

  const campo = page.getByLabel("Link da ideia (https://...)");
  await expect(campo).toBeFocused();
  await expect(campo).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#erro-link")).toHaveText(/http:\/\/ ou https:\/\//);
  await expect(page).toHaveURL(/\/$/);
  expect(posts).toEqual([]);
});

test("Esc fecha o modal e devolve o foco ao botão", async ({ page }) => {
  await page.goto("/");
  const abrir = page.getByRole("button", { name: "+ Adicionar ideia" });
  await abrir.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(abrir).toBeFocused();
});
test("Tab e Shift+Tab ficam dentro do modal aberto", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+ Adicionar ideia" }).click();
  const modal = page.getByRole("dialog");
  const salvar = modal.getByRole("button", { name: "Salvar" });
  await salvar.focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Título da ideia")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(salvar).toBeFocused();
});
/* Fim de fluxo.spec.js */
