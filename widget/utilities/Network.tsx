import { createBinding, createComputed } from "ags"
import { Gtk } from "ags/gtk4"
import NM from "gi://NM?version=1.0"
import GLib from "gi://GLib"

const client = new NM.Client()
const nmState = createBinding(client, "state")

export default function NetworkWidget() {
  const icon = createComputed(() => {
    switch (nmState()) {
        case NM.State.CONNECTED_GLOBAL: return "󰤨"
        case NM.State.CONNECTED_SITE:   return "󰤩"
        case NM.State.CONNECTED_LOCAL:  return "󱛎"
        case NM.State.CONNECTING:       return "󰤨"
        default:                        return "󰤭"
    }
})
  const statusText = createComputed(() => {
    switch (nmState()) {
      case NM.State.CONNECTED_GLOBAL: return "Connected"
      case NM.State.CONNECTED_SITE:   return "Connected (limited)"
      case NM.State.CONNECTED_LOCAL:  return "Local only"
      case NM.State.CONNECTING:       return "Connecting..."
      default:                        return "Disconnected"
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
