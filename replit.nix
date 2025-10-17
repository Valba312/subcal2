cat > replit.nix <<'EOF'
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.python3
    pkgs.pkg-config
    pkgs.libgcc
    pkgs.vips
    pkgs.cacert
  ];
}
EOF