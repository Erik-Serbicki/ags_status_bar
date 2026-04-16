import { createState } from "ags"
import { Gtk, Astal, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import GLib from "gi://GLib"
import AstalIO from "gi://AstalIO?version=0.1"
import { NotificationsSection } from "../notifications/NotificationList"

// ── Open/close state ──────────────────────────────────────────────────────────
const [open, setOpen] = createState(false)

export function toggleQuickSettings() {
  setOpen((v) => !v)
}

function close() {
  setOpen(false)
}

// ── Volume helpers ────────────────────────────────────────────────────────────
function getVolume(): number {
  try {
    const out = AstalIO.Process.exec("pactl get-sink-volume @DEFAULT_SINK@")
    const m = out.match(/(\d+)%/)
    return m ? parseInt(m[1], 10) : 50
  } catch {
    return 50
  }
}

// ── Brightness helpers ────────────────────────────────────────────────────────
function getBrightness(): number {
  try {
    const cur = parseInt(AstalIO.Process.exec("brightnessctl get").trim(), 10)
    const max = parseInt(AstalIO.Process.exec("brightnessctl max").trim(), 10)
    return max > 0 ? Math.round((cur / max) * 100) : 50
  } catch {
    return 50
  }
}

// ── VolumeSection component ───────────────────────────────────────────────────
function VolumeSection() {
  return (
    <box cssName="qs-section" orientation={1} spacing={6}>
      <label cssName="qs-section-title" label="VOLUME" halign={Gtk.Align.START} />
      <box orientation={0} spacing={8} hexpand={true}>
        <label cssName="qs-volume-icon" label="󰕾" />
        <box
          hexpand={true}
          $={(self: Gtk.Box) => {
            const adjustment = new Gtk.Adjustment({
              value: getVolume(),
              lower: 0,
              upper: 100,
              step_increment: 1,
              page_increment: 5,
            })

            const scale = new Gtk.Scale({
              orientation: Gtk.Orientation.HORIZONTAL,
              adjustment,
              draw_value: true,
              digits: 0,
            })
            scale.set_hexpand(true)
            self.append(scale)

            // Set system volume when slider moves
            adjustment.connect("value-changed", () => {
              const val = Math.round(adjustment.get_value())
              GLib.spawn_command_line_async(`pactl set-sink-volume @DEFAULT_SINK@ ${val}%`)
            })

            // Re-sync from system every 2 seconds (tolerance avoids fighting active drags)
            const syncId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
              const sysVol = getVolume()
              if (Math.abs(adjustment.get_value() - sysVol) > 3) {
                adjustment.set_value(sysVol)
              }
              return true // SOURCE_CONTINUE
            })

            self.connect("destroy", () => GLib.source_remove(syncId))
          }}
        />
      </box>
    </box>
  )
}

// ── BrightnessSection component ──────────────────────────────────────────────
function BrightnessSection() {
  return (
    <box cssName="qs-section" orientation={1} spacing={6}>
      <label cssName="qs-section-title" label="BRIGHTNESS" halign={Gtk.Align.START} />
      <box orientation={0} spacing={8} hexpand={true}>
        <label cssName="qs-brightness-icon" label="󰃞" />
        <box
          hexpand={true}
          $={(self: Gtk.Box) => {
            const adjustment = new Gtk.Adjustment({
              value: getBrightness(),
              lower: 0,
              upper: 100,
              step_increment: 1,
              page_increment: 5,
            })

            const scale = new Gtk.Scale({
              orientation: Gtk.Orientation.HORIZONTAL,
              adjustment,
              draw_value: true,
              digits: 0,
            })
            scale.set_hexpand(true)
            self.append(scale)

            // Set system brightness when slider moves
            adjustment.connect("value-changed", () => {
              const val = Math.round(adjustment.get_value())
              GLib.spawn_command_line_async(`brightnessctl set ${val}%`)
            })

            // Re-sync from system every 2 seconds (tolerance avoids fighting active drags)
            const syncId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, () => {
              const sysBright = getBrightness()
              if (Math.abs(adjustment.get_value() - sysBright) > 3) {
                adjustment.set_value(sysBright)
              }
              return true // SOURCE_CONTINUE
            })

            self.connect("destroy", () => GLib.source_remove(syncId))
          }}
        />
      </box>
    </box>
  )
}

// ── Panel window (created inside main() via setupQuickSettings to provide reactive scope for For) ──
const { TOP, BOTTOM, RIGHT } = Astal.WindowAnchor

export function setupQuickSettings() {
  ;(
    <window
      name="quick-settings"
      class="QuickSettings"
      visible={open}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.ON_DEMAND}
      anchor={TOP | BOTTOM | RIGHT}
      application={app}
      $={(self: Astal.Window) => {
        const key = new Gtk.EventControllerKey()
        key.connect("key-pressed", (_: Gtk.EventControllerKey, keyval: number) => {
          if (keyval === Gdk.KEY_Escape) close()
          return false
        })
        self.add_controller(key)
      }}
    >
      <box cssName="qs-panel" orientation={1} spacing={16} valign={Gtk.Align.FILL}>
        <VolumeSection />
        <BrightnessSection />
        <NotificationsSection />
      </box>
    </window>
  ) as Astal.Window
}

export function SettingsButton() {
  return (
    <button cssName="settings-button" onClicked={toggleQuickSettings}>
      <label cssName="settings-icon" label="󰒓" />
    </button>
  )
}
