/* axe nas páginas, com o modal aberto e fechado (#49) */
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

/* Sem rede externa (fontes, imagens de exemplo): o teste depende só do app local */
test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost[:/])/, (route) => route.abort());
});

/* Roda o axe e falha com a lista de violações de qualquer gravidade */
async function semViolacoes(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const resumo = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(resumo).toEqual([]);
}

for (const rota of ["/", "/ideias", "/rota-que-nao-existe"]) {
  test(`axe sem violações em ${rota}`, async ({ page }) => {
    await page.goto(rota);
    await semViolacoes(page);
  });
}

for (const rota of ["/", "/ideias"]) {
  test(`axe sem violações em ${rota} com o modal aberto`, async ({ page }) => {
    await page.goto(rota);
    await page.locator("[data-open-modal]").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await semViolacoes(page);
  });
}

test("axe sem violações no modal com erros de validação", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-open-modal]").first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator("#erro-title")).not.toBeEmpty();
  await semViolacoes(page);
});
/* Fim de axe.spec.js */
