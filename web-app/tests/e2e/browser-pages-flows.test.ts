import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import puppeteer, { type Browser, type BrowserContext, type Page } from "puppeteer-core";

const PAGES_BASE_URL = process.env.E2E_PAGES_BASE_URL ?? "http://127.0.0.1:4173/kypros";
function getChromePath() {
  const candidates = [
    process.env.E2E_CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0] ?? "/usr/bin/google-chrome";
}

const CHROME_PATH = getChromePath();
const GREEK_LESSON_ID = "gr_lesson_022";

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
}

async function createIsolatedPage(browser: Browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.setViewport({ width: 1440, height: 1100 });
  return { context, page };
}

async function closeIsolatedPage(context: BrowserContext) {
  await context.close();
}

async function waitForText(page: Page, text: string) {
  await page.waitForFunction(
    (expectedText) => document.body?.innerText.includes(expectedText),
    {},
    text
  );
}

async function gotoHashPath(page: Page, hashPath: string) {
  const normalizedHashPath = hashPath.startsWith("#") ? hashPath : `#${hashPath}`;
  await page.goto(`${PAGES_BASE_URL}/${normalizedHashPath}`, { waitUntil: "networkidle2" });
}

async function clickByText(page: Page, text: string) {
  await page.waitForFunction(
    (expectedText) =>
      Array.from(document.querySelectorAll<HTMLElement>("a, button")).some(
        (element) => element.innerText.trim() === expectedText
      ),
    {},
    text
  );

  const clicked = await page.evaluate((expectedText) => {
    const target = Array.from(document.querySelectorAll<HTMLElement>("a, button")).find(
      (element) => element.innerText.trim() === expectedText
    );
    target?.click();
    return Boolean(target);
  }, text);

  assert.equal(clicked, true, `Expected clickable element with text: ${text}`);
}

async function getPrimaryProgressLabel(page: Page) {
  return page.$$eval(".hero-gamification-card strong", (elements) =>
    elements[0]?.textContent?.trim() ?? ""
  );
}

test("pages-mode smoke keeps hash dashboard to lesson flow stable", async () => {
  const browser = await launchBrowser();
  const { context, page } = await createIsolatedPage(browser);

  try {
    await gotoHashPath(page, "/dashboard");
    await waitForText(page, "Ваш следующий шаг уже готов");
    await waitForText(page, "Продолжить");

    await clickByText(page, "Продолжить");
    await waitForText(page, "Материал изучен");

    await clickByText(page, "Материал изучен");
    await waitForText(page, "Открыть карточки урока");

    await clickByText(page, "Открыть карточки урока");
    await waitForText(page, "Вы в шаге урока");
    await waitForText(page, "Шаг 3. Мини-проверка урока");

    await clickByText(page, "Шаг 3. Мини-проверка урока");
    await waitForText(page, "Текущий счёт: 0");
    await waitForText(page, "Назад к уроку");
  } finally {
    await closeIsolatedPage(context);
    await browser.close();
  }
});

test("pages-mode keeps hash deep links and local progress stable across reload", async () => {
  const browser = await launchBrowser();
  const { context, page } = await createIsolatedPage(browser);

  try {
    await gotoHashPath(page, `/lessons/${GREEK_LESSON_ID}`);
    await waitForText(page, "Материал изучен");

    await page.reload({ waitUntil: "networkidle2" });
    await waitForText(page, "Материал изучен");

    await clickByText(page, "Материал изучен");
    await waitForText(page, "Открыть карточки урока");

    const storedLessonIds = await page.evaluate(() => {
      const rawValue = window.localStorage.getItem("ccp_completed_lessons");
      return rawValue ? JSON.parse(rawValue) : [];
    });
    assert.ok(storedLessonIds.includes(GREEK_LESSON_ID));

    await gotoHashPath(page, "/dashboard");
    await waitForText(page, "Ваш следующий шаг уже готов");
    assert.match(await getPrimaryProgressLabel(page), /^1 \/ \d+$/);

    await page.reload({ waitUntil: "networkidle2" });
    await waitForText(page, "Ваш следующий шаг уже готов");
    assert.match(await getPrimaryProgressLabel(page), /^1 \/ \d+$/);
  } finally {
    await closeIsolatedPage(context);
    await browser.close();
  }
});
