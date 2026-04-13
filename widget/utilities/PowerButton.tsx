import { createState } from "ags"
import { Gtk, Astal, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import GLib from "gi://GLib"

const [open, setOpen] = createState(false)

function close() {
  setOpen(false)
}

function run(cmd: string) {
  GLib.spawn_command_line_async(cmd)
  close()
}

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

// Created once at module load; visibility is toggled via the `open` state.
const menuWindow = (
  <window
    name="power-menu"
    class="PowerMenu"
    visible={open}
    layer={Astal.Layer.OVERLAY}
    exclusivity={Astal.Exclusivity.IGNORE}
    keymode={Astal.Keymode.ON_DEMAND}
    anchor={TOP | BOTTOM | LEFT | RIGHT}
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
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      $={(self: Gtk.Box) => {
        // Clicks that reach this box (i.e. outside the menu card) close the menu.
        const click = new Gtk.GestureClick()
        click.connect("pressed", close)
        self.add_controller(click)
      }}
    >
      <box
        cssName="power-menu"
        orientation={1}
        spacing={8}
        $={(self: Gtk.Box) => {
          // Stop click propagation so inner clicks don't reach the backdrop.
          const click = new Gtk.GestureClick()
          click.connect("pressed", (_: Gtk.GestureClick, _n: number, x: number, y: number) => {
            click.set_state(Gtk.EventSequenceState.CLAIMED)
          })
          self.add_controller(click)
        }}
      >
        <button cssName="power-menu-btn" onClicked={() => run("systemctl suspend")}>
          <box spacing={10}>
            <label cssName="power-menu-icon" label="󰒲" />
            <label cssName="power-menu-label" label="Suspend" />
          </box>
        </button>
        <button cssName="power-menu-btn" onClicked={() => run("systemctl reboot")}>
          <box spacing={10}>
            <label cssName="power-menu-icon" label="󰜉" />
            <label cssName="power-menu-label" label="Restart" />
          </box>
        </button>
        <button cssName="power-menu-btn" onClicked={() => run("systemctl poweroff")}>
          <box spacing={10}>
            <label cssName="power-menu-icon" label="󰐥" />
            <label cssName="power-menu-label" label="Power Off" />
          </box>
        </button>
      </box>
    </box>
  </window>
) as Astal.Window

export default function PowerButton() {
  return (
    <button cssName="power-button" onClicked={() => setOpen(true)}>
      <label cssName="power-icon" label="󰐥" />
    </button>
  )
}
