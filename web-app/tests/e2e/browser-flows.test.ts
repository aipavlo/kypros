import test from "node:test";
import assert from "node:assert/strict";
import puppeteer, { type Browser, type BrowserContext, type Page } from "puppeteer-core";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
const CHROME_PATH =
  process.env.E2E_CHROME_PATH ?? process.env.PUPPETEER_EXECUTABLE_PATH ?? "/usr/bin/chromium";
const GREEK_LESSON_ID = "gr_lesson_022";
const CYPRUS_LESSON_ID = "cy_lesson_001";
const CYPRUS_LESSON_TITLE = "Республика Кипр: базовая идентичность";

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

async function gotoPath(page: Page, path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle2" });
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

async function getLinkHrefByText(page: Page, text: string) {
  return page.$$eval(
    "a",
    (elements, expectedText) =>
      elements.find((element) => element.textContent?.trim() === expectedText)?.getAttribute("href") ??
      "",
    text
  );
}

test("browser smoke flow keeps landing to lesson flow stable", async () => {
  const browser = await launchBrowser();
  const { context, page } = await createIsolatedPage(browser);

  try {
    await gotoPath(page, "/");
    await waitForText(page, "Греческий язык и подготовка по Кипру в одном месте");

    await clickByText(page, "Открыть главный дашборд");
    await waitForText(page, "Ваш следующий шаг уже готов");
    await waitForText(page, "Начать первый урок");

    await clickByText(page, "Начать первый урок");
    await waitForText(page, "Материал изучен");

    await clickByText(page, "Материал изучен");
    await waitForText(page, "Открыть карточки урока");

    await clickByText(page, "Открыть карточки урока");
    await waitForText(page, "Вы в шаге урока");
    await waitForText(page, "Шаг 3. Мини-проверка урока");

    await clickByText(page, "Шаг 3. Мини-проверка урока");
    await waitForText(page, "Текущий счёт: 0");
    await waitForText(page, "Назад к уроку");

    await clickByText(page, "Назад к уроку");
    await waitForText(page, "Открыть карточки урока");
  } finally {
    await closeIsolatedPage(context);
    await browser.close();
  }
});

test("browser progress flow persists completed lesson across dashboard reload", async () => {
  const browser = await launchBrowser();
  const { context, page } = await createIsolatedPage(browser);

  try {
    await gotoPath(page, `/lessons/${GREEK_LESSON_ID}`);
    await waitForText(page, "Материал изучен");

    await clickByText(page, "Материал изучен");
    await waitForText(page, "Открыть карточки урока");

    const storedLessonIds = await page.evaluate(() => {
      const rawValue = window.localStorage.getItem("ccp_completed_lessons");
      return rawValue ? JSON.parse(rawValue) : [];
    });
    assert.ok(storedLessonIds.includes("gr_lesson_022"));

    await gotoPath(page, "/dashboard");
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

test("browser session flow goes through login, session read and logout", async () => {
  const browser = await launchBrowser();
  const { context, page } = await createIsolatedPage(browser);

  try {
    await gotoPath(page, "/dashboard");
    await waitForText(page, "Ваш следующий шаг уже готов");

    const loginResult = await page.evaluate(async () => {
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: "e2e@kyprospath.app" })
      });
      const loginBody = await loginResponse.json();

      const sessionResponse = await fetch("/api/app/session", {
        credentials: "include"
      });
      const sessionBody = await sessionResponse.json();

      const logoutResponse = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      const logoutBody = await logoutResponse.json();

      const anonymousSessionResponse = await fetch("/api/app/session", {
        credentials: "include"
      });
      const anonymousSessionBody = await anonymousSessionResponse.json();

      return {
        loginStatus: loginResponse.status,
        loginBody,
        sessionBody,
        logoutStatus: logoutResponse.status,
        logoutBody,
        anonymousSessionBody
      };
    });

    assert.equal(loginResult.loginStatus, 200);
    assert.equal(loginResult.loginBody.session.mode, "authenticated");
    assert.equal(loginResult.sessionBody.session.mode, "authenticated");
    assert.equal(loginResult.logoutStatus, 200);
    assert.equal(loginResult.logoutBody.session.mode, "anonymous");
    assert.equal(loginResult.anonymousSessionBody.session.mode, "anonymous");
  } finally {
    await closeIsolatedPage(context);
    await browser.close();
  }
});

test("browser cyprus flow keeps cyprus navigation active through lesson path", async () => {
  const browser = await launchBrowser();
  const { context, page } = await createIsolatedPage(browser);

  try {
    await gotoPath(page, "/cyprus");
    await waitForText(page, "Программа Cyprus Reality");

    const activePrimaryNavLabel = await page.$eval(".nav a.active", (element) =>
      element.textContent?.trim() ?? ""
    );
    assert.equal(activePrimaryNavLabel, "Изучаю Кипр");

    const nextLessonLink = await getLinkHrefByText(
      page,
      `Открыть урок: 1. ${CYPRUS_LESSON_TITLE}`
    );
    assert.equal(nextLessonLink, `/lessons/${CYPRUS_LESSON_ID}?source=loop`);

    await gotoPath(page, nextLessonLink);
    await waitForText(page, "Материал изучен");

    await clickByText(page, "Материал изучен");
    await waitForText(page, "Открыть карточки урока");
    const flashcardsLessonLink = await getLinkHrefByText(page, "Открыть карточки урока");
    assert.ok(flashcardsLessonLink.startsWith("/flashcards?"));
    assert.ok(flashcardsLessonLink.includes("track=cyprus_reality"));
    assert.ok(flashcardsLessonLink.includes(`lesson=${CYPRUS_LESSON_ID}`));
    assert.ok(flashcardsLessonLink.includes("source=lesson"));
    assert.ok(flashcardsLessonLink.includes(`returnTo=${CYPRUS_LESSON_ID}`));
  } finally {
    await closeIsolatedPage(context);
    await browser.close();
  }
});
