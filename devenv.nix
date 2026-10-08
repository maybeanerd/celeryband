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

  packages = [ ];

  # Loads .env into the environment
  dotenv.enable = true;

  scripts.up.exec = ''
    devenv up "$@"
  '';
  processes.dev.exec = "pnpm dev";
}
