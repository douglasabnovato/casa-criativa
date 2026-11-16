/* Layout sem rolagem horizontal (WCAG 1.4.10, Refluxo), em desktop e em 375 px (#55) */
const { test, expect } = require("@playwright/test");

/* Sem rede externa (fontes, imagens de exemplo): o teste depende só do app local */
test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost[:/])/, (route) => route.abort());
});

/* A página não pode ser mais larga que a janela */
async function semRolagemHorizontal(page) {
  const { largura, janela } = await page.evaluate(() => ({
    largura: document.documentElement.scrollWidth,
    janela: document.documentElement.clientWidth,
  }));
  expect(largura, `conteúdo com ${largura}px numa janela de ${janela}px`).toBeLessThanOrEqual(janela);
}

for (const rota of ["/", "/ideias", "/rota-que-nao-existe"]) {
  test(`sem rolagem horizontal em ${rota}`, async ({ page }) => {
    await page.goto(rota);
    await semRolagemHorizontal(page);
  });
}

test("sem rolagem horizontal com o modal aberto", async ({ page }) => {
  await page.goto("/ideias");
  await page.locator("[data-open-modal]").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await semRolagemHorizontal(page);
});

test("a janela tem a largura do projeto (375 px no celular)", async ({ page }, info) => {
  await page.goto("/");
  const esperada = info.project.name === "celular" ? 375 : 1280;
  expect(await page.evaluate(() => window.innerWidth)).toBe(esperada);
});
/* Fim de layout.spec.js */
