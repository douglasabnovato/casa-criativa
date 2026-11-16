/* Testes de interface (Playwright): sobem o app com um banco novo em pasta temporária */
const os = require("os");
const path = require("path");
const { defineConfig, devices } = require("@playwright/test");

const PORT = Number(process.env.E2E_PORT) || 3210;
const DATABASE_FILE = path.join(os.tmpdir(), `casa-criativa-e2e-${Date.now()}.sqlite`);

module.exports = defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    /* Fora do CI dá para apontar um Chromium já instalado (PW_CHROMIUM) */
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [
    /* O CSS não tem prefers-color-scheme: o app não tem tema escuro próprio, então não há projeto escuro */
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    /* Largura de celular (#55) */
    {
      name: "celular",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: "node src/server.js",
    url: `http://localhost:${PORT}/health`,
    reuseExistingServer: false,
    env: { PORT: String(PORT), DATABASE_FILE },
  },
});
/* Fim de playwright.config.js */
