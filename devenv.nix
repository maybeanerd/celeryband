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

  tasks."config:setup" = {
    exec = ''
      if [ ! -f config.yaml ]; then
        echo "config.yaml not found — copying from example.config.yaml"
        cp example.config.yaml config.yaml
      else
        echo "config.yaml already exists, skipping"
      fi
    '';
    before = [ "devenv:enterShell" ];
  };

  scripts.docker-up.exec = ''
    devenv tasks run config:setup
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
  processes.dev = {
    exec = "pnpm dev";
    after = [ "config:setup" ];
  };
}
