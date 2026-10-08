FROM node:24.17.0 AS build
WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "./"]
# Install pnpm
RUN corepack enable pnpm
# Intall dependencies
RUN pnpm i --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24.17.0-slim
WORKDIR /app

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH
ARG VERSION
ENV VERSION=$VERSION

COPY --from=build /app/.output ./.output

CMD ["node", ".output/server/index.mjs"]
