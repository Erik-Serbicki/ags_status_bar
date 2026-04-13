# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the bar

```bash
ags run app.ts
```

To run against a specific GTK version:
```bash
ags run app.ts --gtk 4
```

There is no build step, test suite, or linter configured.

## Architecture

This is an [AGS](https://github.com/Aylur/ags) (Aylur's GTK Shell) status bar for Hyprland, written in TypeScript/TSX targeting GTK4. AGS bundles and runs the app via GJS (GNOME JavaScript runtime) — there is no Node.js or browser involved.

**Entry point:** `app.ts` starts the AGS app, applies `style.scss`, and creates one `Bar` per monitor.

**Widget tree:**
```
Bar (layer-shell window, anchored top)
├── start:  Workspaces
├── center: Calendar + Clock
└── end:    SystemTray
```

**Key framework concepts:**
- `createBinding(obj, "prop")` — reactive binding to a GObject property; re-renders on change
- `createComputed(() => ...)` — derived reactive value from one or more bindings
- `createState(val)` — local component state, returns `[getter, setter]`
- `createPoll(initial, intervalMs, fn)` — polls a function on an interval
- `For` — reactive list renderer (like a keyed map over a binding)
- The `$={(self) => ...}` JSX prop gives imperative access to the underlying GTK widget for attaching controllers, etc.

**GObject/GTK libraries** are imported via GIR: `import Hyprland from "gi://AstalHyprland"`, `import Tray from "gi://AstalTray"`, etc. Type stubs live in `@girs/`.

**Styling** is a single `style.scss` file. CSS names on widgets use `cssName` (maps to GTK's widget name, targeted with unclassed selectors like `clock { }`) or `class` (targeted with `.class`).
