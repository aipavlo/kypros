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
