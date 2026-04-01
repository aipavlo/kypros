SHELL := /bin/bash

INFRA_DIR := infra/web-app-local
COMPOSE := docker compose -f $(INFRA_DIR)/docker-compose.yml

.PHONY: help lint test test-build test-e2e up down logs ps restart docker-build

help:
	@echo "Available targets:"
	@echo "  make lint          - run web-app lint checks"
	@echo "  make test          - run web-app tests"
	@echo "  make test-build    - compile test bundle for web-app"
	@echo "  make test-e2e      - run browser end-to-end tests inside the web container"
	@echo "  make up            - start local website + mysql"
	@echo "  make down          - stop local infra"
	@echo "  make logs          - show local infra logs"
	@echo "  make ps            - show local infra status"
	@echo "  make restart       - restart local infra"
	@echo "  make docker-build  - build local web-app docker image"

lint:
	cd web-app && npm run lint

test:
	cd web-app && npm test

test-build:
	cd web-app && npm run test:build

test-e2e:
	$(COMPOSE) exec -T web sh -lc "cd /workspace/web-app && npm run test:e2e"

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

restart:
	$(MAKE) down
	$(MAKE) up

docker-build:
	$(COMPOSE) build
