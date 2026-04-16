import { createState, createComputed, For } from "ags"
import { Gtk, Astal, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Gio from "gi://Gio"
import GioUnix from "gi://GioUnix?version=2.0"

// ── Types ─────────────────────────────────────────────────────────────────────
interface AppEntry {
  id: string
  name: string
  icon: Gio.Icon | null
}

// ── App helpers ───────────────────────────────────────────────────────────────
const allApps: AppEntry[] = (Gio.app_info_get_all() as Gio.AppInfo[])
  .flatMap((info) => {
    const id = info.get_id()
    if (!id || !info.should_show()) return []
    return [{ id, name: info.get_display_name(), icon: info.get_icon() }]
  })
  .sort((a, b) => a.name.localeCompare(b.name))

function searchApps(query: string): AppEntry[] {
  if (!query.trim()) return allApps.slice(0, 8)
  return (GioUnix.DesktopAppInfo.search(query) as string[][])
    .flat()
    .flatMap((id) => {
      const info = GioUnix.DesktopAppInfo.new(id)
      if (!info || !info.should_show()) return []
      return [{ id, name: info.get_display_name(), icon: info.get_icon() } as AppEntry]
    })
    .slice(0, 8)
}

// ── Module state ──────────────────────────────────────────────────────────────
const [open, setOpen] = createState(false)
const [entries, setEntries] = createState<AppEntry[]>(allApps.slice(0, 8))
const [selectedIndex, setSelectedIndex] = createState(-1)

let entryWidget: Gtk.Entry | null = null

export function toggleRunMenu() {
  setOpen((v) => !v)
}

function close() {
  setOpen(false)
}

function reset() {
  setSelectedIndex(-1)
  setEntries(allApps.slice(0, 8))
  entryWidget?.set_text("")
}

function onQuery(q: string) {
  setSelectedIndex(-1)
  setEntries(searchApps(q))
}

function launchEntry(entry: AppEntry) {
  const info = GioUnix.DesktopAppInfo.new(entry.id)
  if (info) info.launch([], null)
  close()
  reset()
}

function launchSelected() {
  const list = entries()
  const idx = selectedIndex()
  const target = list[idx >= 0 ? idx : 0]
  if (target) launchEntry(target)
}

function moveSelection(delta: number) {
  const max = entries().length - 1
  if (max < 0) return
  setSelectedIndex((i) => Math.max(0, Math.min(max, i + delta)))
}

// ── AppItem component ─────────────────────────────────────────────────────────
function AppItem({ entry }: { entry: AppEntry }) {
  const index = createComputed(() => entries().findIndex((e) => e.id === entry.id))
  const cssClass = createComputed(() =>
    selectedIndex() === index() ? "run-menu-item selected" : "run-menu-item"
  )

  return (
    <button class={cssClass} onClicked={() => launchEntry(entry)}>
      <box orientation={0} spacing={10}>
        <image class="run-menu-item-icon" gicon={entry.icon} iconSize={Gtk.IconSize.LARGE} />
        <label class="run-menu-item-name" label={entry.name} halign={Gtk.Align.START} hexpand={true} />
      </box>
    </button>
  )
}

// ── Window (created inside main() via setupRunMenu to provide a reactive scope for For) ──
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

export function setupRunMenu() {
  ;(
    <window
      name="run-menu"
      class="RunMenu"
      visible={open}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.ON_DEMAND}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      application={app}
      $={(self: Astal.Window) => {
        const key = new Gtk.EventControllerKey()
        key.connect("key-pressed", (_: Gtk.EventControllerKey, keyval: number) => {
          if (keyval === Gdk.KEY_Escape) { close(); reset(); return true }
          if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) { launchSelected(); return true }
          if (keyval === Gdk.KEY_Down) { moveSelection(1); return true }
          if (keyval === Gdk.KEY_Up) { moveSelection(-1); return true }
          return false
        })
        self.add_controller(key)

        // Focus the entry and reset state each time the menu opens
        self.connect("notify::visible", () => {
          if (self.visible) entryWidget?.grab_focus()
          else reset()
        })
      }}
    >
      <box class="run-menu" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} orientation={1} spacing={8}>
        <entry
          class="run-menu-input"
          placeholderText="Search apps..."
          hexpand={true}
          $={(self: Gtk.Entry) => {
            entryWidget = self
            self.connect("changed", () => onQuery(self.get_text()))
          }}
        />
        <box class="run-menu-results" orientation={1} spacing={2}>
          <For each={entries}>
            {(entry) => <AppItem entry={entry} />}
          </For>
        </box>
      </box>
    </window>
  ) as Astal.Window
}
