import { createBinding, createComputed, For} from "ags"
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

  return (
    <box 
        cssName="workspaces" 
        orientation={0} 
        spacing={4}
        onScroll={(self, dx, dy) => {
        if (dy > 0) hyprland.dispatch("workspace", "e+1")
        if (dy < 0) hyprland.dispatch("workspace", "e-1")
      }}
    >
      <For each={allIds}>
        {(id) => <WorkspaceButton id={id} />}
      </For>
    </box>
  )
}
