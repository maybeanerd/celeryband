FROM node:22.14.0-slim
WORKDIR /app

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH

COPY ["package.json", ".npmrc", "pnpm-lock.yaml", "./"]
# Install pnpm
RUN corepack enable pnpm
# Intall dependencies
RUN pnpm i

# Build
COPY . .
RUN pnpm build

# Start service
CMD ["node", ".output/server/index.mjs"]
