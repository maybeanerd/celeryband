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
    COMMIT_HASH="$(git rev-parse --short HEAD)" \
    VERSION="local" \
    docker-compose up --build "$@"
  '';
  scripts.docker-down.exec = ''
    docker-compose down "$@"
  '';

  scripts.up.exec = ''
    devenv up "$@"
  '';
  processes.dev.exec = "pnpm dev";
}
