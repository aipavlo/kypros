# Project Structure

В корне проекта для повседневной работы важны две директории и общий `Makefile`.

## Быстрый старт

Из корня проекта:

```bash
make lint
make test
make up
```

Основные команды:

- `make lint` — lint-проверка сайта
- `make test` — прогон тестов сайта из `web-app`
- `make test-e2e` — отдельный browser E2E прогон внутри web-контейнера
- `make test-build` — только сборка test bundle
- `make up` — локальный запуск `website + mysql`
- `make down` — остановка локальной infra-среды
- `make logs` — логи локальной infra-среды
- `make ps` — статус локальной infra-среды
- `make restart` — перезапуск локальной infra-среды
- `make docker-build` — сборка локального docker-образа сайта

## Два режима публикации

Проект поддерживает два совместимых режима развёртывания без отдельной кодовой базы:

- обычный хостинг с backend/runtime и БД;
- статическая публикация на `GitHub Pages` через встроенный `GitHub Actions`.

### 1. Хостинг с БД

Это основной runtime-сценарий проекта:

- используется стандартная сборка `next build`;
- остаются доступны `app/api/*`, сессии, cookies и серверные интеграции;
- режим приложения можно переключать через `NEXT_PUBLIC_APP_MODE`, при `db` используется серверный клиент.

Локально этот сценарий поднимается через:

```bash
make up
```

### 2. GitHub Pages

Для `GitHub Pages` используется отдельный export-режим сборки:

- включается `NEXT_PUBLIC_DEPLOY_TARGET=github-pages`;
- приложение автоматически переключается в `no-db`;
- клиентский роутинг переводится на `HashRouter`, чтобы не ломаться на статическом хостинге;
- `Next.js` собирает статический export без отказа от основной hosted-реализации.

Локальная команда для такой сборки:

```bash
cd web-app
NEXT_PUBLIC_BASE_PATH=/REPOSITORY_NAME \
NEXT_PUBLIC_SITE_URL=https://USERNAME.github.io/REPOSITORY_NAME \
npm run build:pages
```

### Что переиспользуется в обоих режимах

Одинаковыми остаются:

- все экраны из `web-app/src/screens`;
- общий UI и layout;
- контент из `app-content` и `web-app/app-content`;
- клиентская логика прогресса, маршрутов, карточек, квизов и библиотеки контента.

Разница только в data-access слое:

- на хостинге с БД работает `dbAppClient`;
- на `GitHub Pages` используется `localAppClient` и локальное хранение прогресса.

## GitHub Actions для GitHub Pages

workflow `.github/workflows/deploy-pages.yml`.

- запускается при push в `main`;
- использует `Node.js 20.9.0`;
- вычисляет `base path` под имя репозитория;
- собирает сайт в export-режиме;
- публикует артефакт в `GitHub Pages`.

## `web-app`

Основной сайт на `Next.js`.

Здесь находится:

- runtime-код сайта;
- `app`, `src`, `public`;
- зафиксированные npm-зависимости и build-конфигурация.

## `infra`

Локальная инфраструктурная обвязка для запуска и сопровождения сайта.

Здесь находится:

- docker-compose и Dockerfile для локального окружения;
- локальная docker-конфигурация, которую использует корневой `Makefile`;
- локальная infra-конфигурация, вынесенная отдельно от runtime-кода сайта.

## Зафиксированные версии

- `Node.js 20.9.0`
- `npm 9.2.0`
- `MySQL 8.4`

`make up` использует локальную docker-обвязку из `infra/web-app-local` и поднимает сайт с той же закреплённой версией `npm 9.2.0`, что и в `web-app/package.json`.
Для `Next.js` не нужно вручную фиксировать `NODE_ENV=development` в compose: `next dev` выставляет нужный режим сам, а `next build` должен выполняться в production-режиме.
`make test` остаётся быстрым test-pass без browser E2E; для браузерного прогона используется отдельный `make test-e2e`.
