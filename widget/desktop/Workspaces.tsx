import { Gdk, Astal } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"

const hyprland = Hyprland.get_default()

function WorkspaceButton({ id }: { id: number }) {
  return (
    <button
      cssName="workspace-btn"
      onClicked={() => hyprland.dispatch("workspace", String(id))}
    >
      <label
        cssName="workspace-label"
        label={String(id)}
      />
    </button>
  )
}

export default function Workspaces() {
  const WORKSPACE_COUNT = 5

  return (
    <box
      cssName="workspaces"
      orientation={0}
      spacing={4}
    >
      {Array.from({ length: WORKSPACE_COUNT }, (_, i) => (
        <WorkspaceButton id={i + 1} />
      ))}
    </box>
  )
}
