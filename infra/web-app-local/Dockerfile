FROM node:20.9.0-bookworm

WORKDIR /workspace/web-app

COPY web-app/package.json web-app/package-lock.json web-app/.npmrc web-app/.nvmrc ./

RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@9.2.0 && npm --version && npm ci

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
