FROM node:22.15.1-slim
WORKDIR /app

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH
ARG VERSION
ENV VERSION=$VERSION

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
