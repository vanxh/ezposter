FROM oven/bun:1 as base
WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN if [ "$NODE_ENV" = "production" ]; then \
    bun install --frozen-lockfile --production; \
    else \
    bun install --frozen-lockfile; \
    fi

COPY . .

RUN if [ "$NODE_ENV" != "production" ]; then \
    bun test; \
    fi

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "start"]