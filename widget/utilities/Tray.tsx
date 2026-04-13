import { createBinding, createComputed, createState, For } from "ags"
import { Gtk } from "ags/gtk4"
import Tray from "gi://AstalTray"
import Gio from "gi://Gio"

const tray = Tray.get_default()

function TrayItem({ item }: { item: Tray.TrayItem }) {
  const menuModel = createBinding(item, "menuModel")
  const gicon = createBinding(item, "gicon")

  function showContextMenu(widget: Gtk.Widget) {
    const model = menuModel()
    let popover: Gtk.PopoverMenu

    if (model) {
      popover = Gtk.PopoverMenu.new_from_model(model)
    } else {
      const appName = item.title || "App"

      const menu = new Gio.Menu()

      const nameSection = new Gio.Menu()
      nameSection.append(appName, "tray.noop")
      menu.append_section(null, nameSection)

      const actionsSection = new Gio.Menu()
      actionsSection.append("Quit", "tray.quit")
      menu.append_section(null, actionsSection)

      popover = Gtk.PopoverMenu.new_from_model(menu)

      const group = new Gio.SimpleActionGroup()

      const noop = new Gio.SimpleAction({ name: "noop", enabled: false })
      group.add_action(noop)

      const quit = new Gio.SimpleAction({ name: "quit" })
      quit.connect("activate", () => item.activate(0, 0))
      group.add_action(quit)

      widget.insert_action_group("tray", group)
    }

    popover.set_parent(widget)
    popover.popup()
  }

  return (
    <button
      cssName="tray-item"
      onClicked={() => item.activate(0, 0)}
      $={(self) => {
        const gesture = new Gtk.GestureClick()
        gesture.set_button(3)
        gesture.connect("pressed", () => showContextMenu(self))
        self.add_controller(gesture)
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
