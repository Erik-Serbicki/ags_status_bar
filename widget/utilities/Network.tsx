import { createBinding, createComputed } from "ags"
import { Gtk } from "ags/gtk4"
import NM from "gi://NM?version=1.0"
import GLib from "gi://GLib"

const client = new NM.Client()
const connectivity = createBinding(client, "connectivity")

const connected = createComputed(() => {
  const state = connectivity()
  return state === NM.ConnectivityState.FULL || state === NM.ConnectivityState.LIMITED
})

export default function NetworkWidget() {
  const icon = createComputed(() => connected() ? "󰤨" : "󰤭")
  const statusText = createComputed(() => {
    switch (connectivity()) {
      case NM.ConnectivityState.FULL:    return "Connected"
      case NM.ConnectivityState.LIMITED: return "Limited connectivity"
      case NM.ConnectivityState.PORTAL:  return "Captive portal"
      default:                           return "Disconnected"
    }
  })

  const popoverChild = (
    <box cssName="network-menu" orientation={1} spacing={8}>
      <label cssName="network-status" label={statusText} halign={Gtk.Align.START} />
      <button
        cssName="network-menu-btn"
        onClicked={() => GLib.spawn_command_line_async("nm-connection-editor")}
      >
        <box spacing={8}>
          <label cssName="network-menu-icon" label="󰒓" />
          <label cssName="network-menu-label" label="Network Settings" />
        </box>
      </button>
    </box>
  ) as Gtk.Widget

  const popover = new Gtk.Popover()
  popover.set_child(popoverChild)

  return (
    <button
      cssName="network-button"
      $={(self: Gtk.Button) => {
        popover.set_parent(self)
        self.connect("clicked", () => popover.popup())
      }}
    >
      <label cssName="network-icon" label={icon} />
    </button>
  )
}
