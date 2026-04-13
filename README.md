# status_bar

A personal Hyprland status bar built with [AGS](https://github.com/Aylur/ags) (Aylur's GTK Shell), written in TypeScript/TSX targeting GTK4. Shows workspaces, a clock/calendar, system tray, and battery status.

**Dependencies:** `ags`, `astal-hyprland`, `astal-tray`, `astal-battery`, and a Nerd Font (Iosevka Term Nerd Font recommended for the icons).

```bash
ags run app.ts          # run the bar
ags run app.ts --gtk 4  # explicitly target GTK4
```
