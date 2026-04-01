# Kypros

Сайт на `Next.js` для изучения греческого языка и подготовки по Кипру. Один код обслуживает два режима: основной hosted-вариант с backend/БД и статическую публикацию в `GitHub Pages`.

## Быстрый старт

Из корня проекта:

```bash
make lint
make test
make up
```

Основные команды:

- `make lint` — lint-проверка сайта
- `make test` — unit и integration тесты из `web-app`
- `make test-e2e` — browser E2E внутри web-контейнера
- `make test-build` — только сборка test bundle
- `make up` — локальный запуск `website + mysql`
- `make down` — остановка локальной infra-среды
- `make logs` — логи контейнеров
- `make ps` — статус контейнеров
- `make restart` — перезапуск локальной среды
- `make docker-build` — пересборка локального docker-образа сайта

Если менялись `package.json`, `package-lock.json`, `.npmrc` или версия `Node.js/npm` в Dockerfile, сначала пересобери образ:

```bash
make docker-build
make up
```

## Разделы сайта

- `Учу греческий`
- `Изучаю Кипр`
- `Повторение карточек`
- `Квиз: проверка знаний`
- `Прогресс`

## Режимы запуска

### 1. Основной хостинг с БД

Это основной runtime-сценарий:

- используется обычный `next build`
- доступны `app/api/*`, cookies, сессии и серверные интеграции
- в data-access слое работает `dbAppClient`

Локально:

```bash
make up
```

### 2. GitHub Pages

Для `GitHub Pages` используется отдельный export-режим:

- включается `NEXT_PUBLIC_DEPLOY_TARGET=github-pages`
- приложение переключается в `no-db`
- используется `localAppClient`
- клиентский роутинг переводится на `HashRouter`
- после сборки дополнительно создаются `robots.txt` и `sitemap.xml`

Локальная проверка Pages-сборки:

```bash
cd web-app
NEXT_PUBLIC_BASE_PATH=/REPOSITORY_NAME \
NEXT_PUBLIC_SITE_URL=https://USERNAME.github.io/REPOSITORY_NAME \
NEXT_PUBLIC_APP_MODE=no-db \
NEXT_PUBLIC_DEPLOY_TARGET=github-pages \
npm run build:pages
```

## GitHub Pages CI

Workflow: `.github/workflows/deploy-pages.yml`

Что делает CI:

- запускается по push тега формата `v0.0.3`
- использует `Node.js 20.9.0`
- фиксирует `npm 9.2.0`
- считает `basePath` под имя репозитория
- запускает `lint`
- запускает `test`
- собирает `GitHub Pages`-вариант сайта
- публикует артефакт в `GitHub Pages`

Для репозитория `USERNAME/REPOSITORY_NAME` итоговый URL такой:

```text
https://USERNAME.github.io/REPOSITORY_NAME
```

Пример релиза:

```bash
git add .
git commit -m "Release v0.0.3"
git tag v0.0.3
git push origin main
git push origin v0.0.3
```

Следующий релиз:

```bash
git tag v0.0.4
git push origin v0.0.4
```

## Что общее для обоих режимов

Переиспользуются:

- экраны из `web-app/src/screens`
- общий UI и layout
- контент из `app-content` и `web-app/app-content`
- клиентская логика прогресса, маршрутов, карточек, квизов и библиотеки

Различается только слой доступа к данным:

- hosted-режим — `dbAppClient`
- `GitHub Pages` — `localAppClient`

## Структура проекта

### `web-app`

Основной сайт на `Next.js`:

- `app`, `src`, `public`
- runtime-код сайта
- зависимости и build-конфигурация

SEO и metadata лежат здесь:

- `web-app/app/layout.tsx`
- `web-app/src/seo/siteMetadata.ts`
- `web-app/src/seo/siteFiles.ts`
- `web-app/scripts/build-pages.mjs`

### `infra`

Локальная инфраструктура:

- Dockerfile и `docker-compose`
- локальная конфигурация для `make up`
- отдельная infra-обвязка, вынесенная из runtime-кода

## Зафиксированные версии

- `Node.js 20.9.0`
- `npm 9.2.0`
- `MySQL 8.4`

Важно:

- `make up` использует docker-обвязку из `infra/web-app-local`
- зависимости в локальном контейнере ставятся на этапе `docker build`, а не при каждом `docker compose up`
- `next dev` сам работает в development-режиме, вручную фиксировать `NODE_ENV=development` не нужно

## SEO

Сайт уже поддерживает базовый SEO-набор и для hosted-режима, и для `GitHub Pages`:

- `title`, `description`, `canonical`
- `Open Graph` и `Twitter Card`
- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`
- favicon/icon
- `WebSite` JSON-LD

Для `GitHub Pages` абсолютные URL, `canonical`, `og:url`, `manifest` и иконки собираются с учётом `basePath`, чтобы сайт корректно работал по адресу вида `/kypros`.
