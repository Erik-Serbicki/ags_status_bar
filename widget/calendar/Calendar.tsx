import { createPoll } from "ags/time"
import GLib from "gi://GLib"

// --- Icon config — comment out the icon line in CalendarDisplay to hide it ---
const CALENDAR_ICON = "󰃭"

function CalendarDisplay({ date }: { date: string }) {
  return (
    <box cssName="calendar" orientation={0} spacing={4}>
      {/* Comment out the line below to hide the icon */}
      <label cssName="calendar-icon" label={CALENDAR_ICON} />
      <label cssName="calendar-date" label={date} />
    </box>
  )
}

export default function Calendar() {
  const date = createPoll("", 60000, () => {
    return GLib.DateTime.new_now_local().format("%a, %B %e") ?? ""
  })

  return <CalendarDisplay date={date} />
}
