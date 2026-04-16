import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import puppeteer, { type Browser, type BrowserContext, type Page } from "puppeteer-core";
import { getQuizQuestionsByLesson } from "../../src/content/quizData.js";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
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
const CYPRUS_LESSON_ID = "cy_lesson_001";
const CYPRUS_LESSON_TITLE = "Республика Кипр: базовая идентичность";
const CYPRUS_RETRY_LESSON_ID = "cy_lesson_008";
const cyprusRetryQuestion = getQuizQuestionsByLesson(CYPRUS_RETRY_LESSON_ID)[0];
const cyprusRetryWrongOption =
  cyprusRetryQuestion?.options.find((option) => option !== cyprusRetryQuestion.correctAnswer) ?? null;

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

async function clickFirstMatching(page: Page, selector: string, expectedText: string) {
  await page.waitForFunction(
    ({ query, text }) =>
      Array.from(document.querySelectorAll<HTMLElement>(query)).some(
        (element) => element.innerText.trim() === text
      ),
    {},
    { query: selector, text: expectedText }
  );

  const clicked = await page.evaluate(
    ({ query, text }) => {
      const target = Array.from(document.querySelectorAll<HTMLElement>(query)).find(
        (element) => element.innerText.trim() === text
      );
      target?.click();
      return Boolean(target);
    },
    { query: selector, text: expectedText }
  );

  assert.equal(clicked, true, `Expected clickable ${selector} with text: ${expectedText}`);
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

    await clickByText(page, "Открыть дашборд");
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

test("browser quiz flow can retry only saved mistakes without losing the focused mode", async () => {
  assert.ok(cyprusRetryQuestion, "Expected Cyprus retry question fixture to exist");
  assert.ok(cyprusRetryWrongOption, "Expected a wrong answer option for Cyprus retry fixture");

  const browser = await launchBrowser();
  const { context, page } = await createIsolatedPage(browser);

  try {
    await gotoPath(
      page,
      `/quiz?mode=mode_cyprus_reality&module=cy_intro_identity&lesson=${CYPRUS_RETRY_LESSON_ID}&source=lesson`
    );
    await waitForText(page, "Текущий счёт: 0");
    await waitForText(page, String(cyprusRetryQuestion.question));

    await clickFirstMatching(page, ".option-button", String(cyprusRetryWrongOption));
    await waitForText(page, "Правильный ответ:");
    await clickByText(page, "Завершить");

    await waitForText(page, "Результат");
    await waitForText(page, "Открыть compact retry");
    await clickByText(page, "Открыть compact retry");

    await waitForText(page, "Compact retry");
    await waitForText(page, "Self-check before retry");
    await waitForText(page, "1 / 1");
    await waitForText(page, String(cyprusRetryQuestion.question));
  } finally {
    await closeIsolatedPage(context);
    await browser.close();
  }
});

test("browser adaptive smoke keeps core pages readable on mobile and desktop widths", async () => {
  const browser = await launchBrowser();
  const { context, page } = await createIsolatedPage(browser);
  const scenarios = [
    {
      path: "/",
      texts: ["Греческий язык и подготовка по Кипру в одном месте"]
    },
    {
      path: "/dashboard",
      texts: ["Ваш следующий шаг уже готов"]
    },
    {
      path: `/lessons/${GREEK_LESSON_ID}`,
      texts: ["Материал урока"]
    },
    {
      path: `/flashcards?track=greek_b1&module=gr_b1_core_grammar&lesson=${GREEK_LESSON_ID}&source=lesson&returnTo=${GREEK_LESSON_ID}`,
      texts: ["Вы в шаге урока"]
    },
    {
      path: "/content",
      texts: ["Библиотека контента"]
    }
  ];

  try {
    for (const width of [390, 1280]) {
      await page.setViewport({ width, height: 1100 });

      for (const scenario of scenarios) {
        await gotoPath(page, scenario.path);

        for (const text of scenario.texts) {
          await waitForText(page, text);
        }
      }
    }
  } finally {
    await closeIsolatedPage(context);
    await browser.close();
  }
});
