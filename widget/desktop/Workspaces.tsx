import { createBinding, createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"

const hyprland = Hyprland.get_default()

function WorkspaceButton({ id }: { id: number }) {
  const focusedWs = createBinding(hyprland, "focusedWorkspace")
  const workspaces = createBinding(hyprland, "workspaces")

  const cssClass = createComputed(() => {
    const ws = workspaces().find((ws) => ws.id === id)
    const clients = ws?.get_clients() ?? []

    const active = focusedWs()?.id === id
    const occupied = clients.length > 0
    const urgent = clients.some((c) => c.urgent)

    const classes = ["workspace-btn"]
    if (active) classes.push("active")
    if (occupied && !active) classes.push("occupied")
    if (urgent) classes.push("urgent")
    return classes.join(" ")
  })

  return (
    <button
      class={cssClass}
      onClicked={() => hyprland.dispatch("workspace", String(id))}
    >
      <label cssName="workspace-label" label={String(id)} />
    </button>
  )
}

export default function Workspaces() {
  const STATIC_COUNT = 5
  const MAX_COUNT = 10

  function onScroll(dy: number) {
    if (dy > 0) hyprland.dispatch("workspace", "e+1")
    if (dy < 0) hyprland.dispatch("workspace", "e-1")
  }

  const dynamicIds = createBinding(hyprland, "workspaces").as((workspaces) =>
    workspaces
      .map((ws) => ws.id)
      .filter((id) => id > STATIC_COUNT && id <= MAX_COUNT)
      .sort((a, b) => a - b)
  )

  const allIds = createComputed(() => {
    const static_ = Array.from({ length: STATIC_COUNT }, (_, i) => i + 1)
    return [...static_, ...dynamicIds()]
  })

  // return a box with a button for each workspace, and add a scroll event to switch workspaces
  return (
    <box
      cssName="workspaces"
      orientation={0}
      spacing={4}
      $={(self) => {
        const scroll = new Gtk.EventControllerScroll()
        scroll.set_flags(Gtk.EventControllerScrollFlags.VERTICAL)
        scroll.connect("scroll", (_, dx, dy) => onScroll(dy))
        self.add_controller(scroll)
      }}
    >
      <For each={allIds}>
        {(id) => <WorkspaceButton id={id} />}
      </For>
    </box>
  )
}
