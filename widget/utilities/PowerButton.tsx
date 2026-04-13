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
      // Close on Escape key.
      const key = new Gtk.EventControllerKey()
      key.connect("key-pressed", (_: Gtk.EventControllerKey, keyval: number) => {
        if (keyval === Gdk.KEY_Escape) close()
        return false
      })
      self.add_controller(key)

      // Close when clicking anywhere on the backdrop (the full-screen window).
      // The inner menu box claims its own clicks so they don't bubble here.
      const click = new Gtk.GestureClick()
      click.connect("pressed", close)
      self.add_controller(click)
    }}
  >
    <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
      <box
        cssName="power-menu"
        orientation={1}
        spacing={8}
        $={(self: Gtk.Box) => {
          // Claim all clicks on the menu card so they don't reach the window.
          const click = new Gtk.GestureClick()
          click.connect("pressed", () => {
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
    <button cssName="power-button" onClicked={() => setOpen((v) => !v)}>
      <label cssName="power-icon" label="󰐥" />
    </button>
  )
}
