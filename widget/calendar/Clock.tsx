import { createPoll } from "ags/time"
import GLib from "gi://GLib"

// --- Icon config — comment out the icon line in ClockDisplay to hide it ---
const CLOCK_ICON = ""

function ClockDisplay({ time }: { time: string }) {
  return (
    <box cssName="clock" orientation={0} spacing={11}>
      {/* Comment out the line below to hide the icon */}
      <label cssName="clock-icon" label={CLOCK_ICON} />
      <label cssName="clock-time" label={time} />
    </box>
  )
}

export default function Clock() {
  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format("%I:%M %p") ?? ""
  })

  return <ClockDisplay time={time} />
}
