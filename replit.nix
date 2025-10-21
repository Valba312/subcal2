{ pkgs }:

{
  deps = [
    pkgs.nodejs_20           # Node.js 20.x
    pkgs.nodePackages.npm    # npm
    pkgs.bashInteractive     # нормальный bash
    pkgs.coreutils
    pkgs.git
  ];
}
