{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24; # matches .nvmrc
    pnpm = {
      enable = true;
      package = pkgs.pnpm_10; # matches packageManager in package.json
      install.enable = true; # runs `pnpm install` on shell enter
    };
  };

  packages = [ ];

  # Loads .env into the environment
  dotenv.enable = true;

  # `devenv up` starts the dev server
  processes.dev.exec = "pnpm dev";
}
