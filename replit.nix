
{ pkgs }: {
  deps = [
    pkgs.cypress
    pkgs.postgresql
    pkgs.glib
    pkgs.gtk3
    pkgs.xorg.libXtst
    pkgs.xorg.libXScrnSaver
    pkgs.nss
    pkgs.alsa-lib
    pkgs.at-spi2-atk
    pkgs.at-spi2-core
    pkgs.cups
    pkgs.dbus
    pkgs.libdrm
    pkgs.libxkbcommon
    pkgs.mesa
    pkgs.wayland
  ];
}
