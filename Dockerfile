FROM node:24.20.0 AS build
WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "./"]
# Install pnpm
RUN corepack enable pnpm
# Install dependencies
RUN pnpm i --frozen-lockfile

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH
ARG VERSION
ENV VERSION=$VERSION

COPY . .
RUN pnpm build

FROM node:24.20.0-slim
WORKDIR /app

COPY --from=build /app/.output ./.output
COPY --from=build /app/server/db/migrations ./server/db/migrations

RUN mkdir -p data

CMD ["node", ".output/server/index.mjs"]
