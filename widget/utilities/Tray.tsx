import { createBinding, createComputed, createState, For } from "ags"
import { Gtk } from "ags/gtk4"
import Tray from "gi://AstalTray"

const tray = Tray.get_default()

function TrayItem({ item }: { item: Tray.TrayItem }) {
  const menuModel = createBinding(item, "menuModel")
  const gicon = createBinding(item, "gicon")
  return (
    <button
      cssName="tray-item"
      onClicked={(self) => {
        if (menuModel()) {
          const menu = Gtk.Menu.new_from_model(menuModel()!)
          menu.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null)
        } else {
          item.activate(0, 0)
        }
      }}
    >
      <image
        cssName="tray-item-icon"
        gicon={gicon}
        iconSize={Gtk.IconSize.SMALL}
      />
    </button>
  )
}

export default function SystemTray() {
  const [expanded, setExpanded] = createState(false)
  const items = createBinding(tray, "items")

  const visibleItems = createComputed(() => {
    if (expanded()) return items()
    return items().slice(0, 1)
  })

  return (
    <box cssName="tray" orientation={0} spacing={4}>
      <For each={visibleItems}>
        {(item) => <TrayItem item={item} />}
      </For>
      <button
        cssName="tray-toggle"
        onClicked={() => setExpanded((v) => !v)}
      >
        <label
          cssName="tray-toggle-icon"
          label={expanded(() => (expanded() ? "" : ""))}
        />
      </button>
    </box>
  )
}
