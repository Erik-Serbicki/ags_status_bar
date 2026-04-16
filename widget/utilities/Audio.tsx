import { createPoll } from "ags/time"
import AstalIO from "gi://AstalIO?version=0.1"

function getMuteState(): boolean {
  try {
    const output = AstalIO.Process.exec("pactl get-sink-mute @DEFAULT_SINK@")
    return output.trim().endsWith("yes")
  } catch {
    return false
  }
}

export default function AudioWidget() {
  const muted = createPoll(getMuteState(), 500, getMuteState)

  return (
    <button
      cssName="audio-button"
      class={muted((m) => (m ? "audio muted" : "audio"))}
      onClicked={() => AstalIO.Process.exec("pactl set-sink-mute @DEFAULT_SINK@ toggle")}
    >
      <label cssName="audio-icon" label={muted((m) => (m ? "󰝟" : "󰕾"))} />
    </button>
  )
}
