{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24; # matches .nvmrc
    pnpm = {
      enable = true;
      package = pkgs.pnpm_12; # matches packageManager in package.json
      install.enable = true; # runs `pnpm i` on shell enter
    };
  };

  packages = [
    pkgs.node-gyp
    pkgs.python3
    pkgs.docker
    pkgs.docker-compose
  ];

  # Loads .env into the environment
  dotenv.enable = true;

  scripts.docker-up.exec = ''
    # Copy example config to local config if it doesn't exist
    [ ! -f config.yaml ] && cp example.config.yaml config.yaml
    COMMIT_HASH="$(git rev-parse --short HEAD)" \
    VERSION="local" \
    docker-compose -f docker-compose.yml -f docker-compose.local.yml up --build "$@"
  '';
  scripts.docker-down.exec = ''
    docker-compose down "$@"
  '';

  scripts.up.exec = ''
    devenv up "$@"
  '';
  processes.dev.exec = "pnpm dev";
}
