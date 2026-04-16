import { createState, createComputed } from "ags"
import { createPoll } from "ags/time"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib"

const CLOCK_ICON = ""

// ── Module-level time poll (shared with alarm check) ──────────────────────────
const time = createPoll("", 1000, () => {
  const dt = GLib.DateTime.new_now_local()
  checkAlarm(dt)
  return dt.format("%I:%M %p") ?? ""
})

// ── Timer state ───────────────────────────────────────────────────────────────
const [timerRemaining, setTimerRemaining] = createState(0)
const [timerStatus, setTimerStatus] = createState<"idle" | "running" | "paused" | "done">("idle")
let timerSourceId: number | null = null
let timerMinEntry: Gtk.Entry | null = null
let timerSecEntry: Gtk.Entry | null = null

// ── Alarm state ───────────────────────────────────────────────────────────────
const [alarmTarget, setAlarmTarget] = createState("")
const [alarmStatus, setAlarmStatus] = createState<"idle" | "set" | "fired">("idle")
let alarmEntry: Gtk.Entry | null = null

// ── Timer functions ───────────────────────────────────────────────────────────
function parseTimerInput(): number {
  const mins = parseInt(timerMinEntry?.get_text() ?? "0", 10) || 0
  const secs = parseInt(timerSecEntry?.get_text() ?? "0", 10) || 0
  return mins * 60 + secs
}

function startTimer() {
  if (timerSourceId !== null) return
  timerSourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
    const remaining = timerRemaining() - 1
    if (remaining <= 0) {
      setTimerRemaining(0)
      setTimerStatus("done")
      timerSourceId = null
      GLib.spawn_command_line_async("notify-send 'Timer' 'Time is up!'")
      return false // SOURCE_REMOVE
    }
    setTimerRemaining(remaining)
    return true // SOURCE_CONTINUE
  })
  setTimerStatus("running")
}

function pauseTimer() {
  if (timerSourceId !== null) {
    GLib.source_remove(timerSourceId)
    timerSourceId = null
  }
  setTimerStatus("paused")
}

function resetTimer() {
  if (timerSourceId !== null) {
    GLib.source_remove(timerSourceId)
    timerSourceId = null
  }
  setTimerRemaining(0)
  setTimerStatus("idle")
  if (timerMinEntry) timerMinEntry.set_text("")
  if (timerSecEntry) timerSecEntry.set_text("")
}

// ── Alarm functions ───────────────────────────────────────────────────────────
function checkAlarm(dt: GLib.DateTime) {
  if (alarmStatus() !== "set") return
  const target = alarmTarget()
  if (!target) return
  const current = dt.format("%H:%M") ?? ""
  if (current === target) {
    setAlarmStatus("fired")
    setAlarmTarget("")
    GLib.spawn_command_line_async(`notify-send 'Alarm' 'Alarm for ${target} is ringing!'`)
  }
}

// ── TimerTab component ────────────────────────────────────────────────────────
function TimerTab() {
  const displayRemaining = createComputed(() => {
    const r = timerRemaining()
    const m = Math.floor(r / 60).toString().padStart(2, "0")
    const s = (r % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  })

  const statusLabel = createComputed(() => {
    switch (timerStatus()) {
      case "running": return "Running"
      case "paused":  return "Paused"
      case "done":    return "Done!"
      default:        return ""
    }
  })

  const startPauseLabel = createComputed(() =>
    timerStatus() === "running" ? "Pause" : "Start"
  )

  return (
    <box cssName="timer-tab" orientation={1} spacing={8}>
      <box orientation={0} spacing={4} halign={Gtk.Align.CENTER}>
        <entry
          cssName="timer-entry"
          placeholderText="MM"
          maxLength={2}
          widthChars={3}
          $={(self: Gtk.Entry) => { timerMinEntry = self }}
        />
        <label label=":" />
        <entry
          cssName="timer-entry"
          placeholderText="SS"
          maxLength={2}
          widthChars={3}
          $={(self: Gtk.Entry) => { timerSecEntry = self }}
        />
      </box>
      <label cssName="timer-countdown" label={displayRemaining} halign={Gtk.Align.CENTER} />
      <label cssName="timer-status" label={statusLabel} halign={Gtk.Align.CENTER} />
      <box orientation={0} spacing={6} halign={Gtk.Align.CENTER}>
        <button
          cssName="timer-btn"
          $={(self: Gtk.Button) => {
            self.connect("clicked", () => {
              if (timerStatus() === "running") {
                pauseTimer()
              } else {
                if (timerStatus() === "idle" || timerStatus() === "done") {
                  const total = parseTimerInput()
                  if (total <= 0) return
                  setTimerRemaining(total)
                }
                startTimer()
              }
            })
          }}
        >
          <label label={startPauseLabel} />
        </button>
        <button cssName="timer-btn" onClicked={resetTimer}>
          <label label="Reset" />
        </button>
      </box>
    </box>
  )
}

// ── AlarmTab component ────────────────────────────────────────────────────────
function AlarmTab() {
  const statusLabel = createComputed(() => {
    switch (alarmStatus()) {
      case "set":   return `Set for ${alarmTarget()}`
      case "fired": return "Alarm fired!"
      default:      return "No alarm set"
    }
  })

  const setCancel = createComputed(() =>
    alarmStatus() === "set" ? "Cancel" : "Set"
  )

  return (
    <box cssName="alarm-tab" orientation={1} spacing={8}>
      <entry
        cssName="alarm-entry"
        placeholderText="HH:MM (24h)"
        maxLength={5}
        widthChars={10}
        halign={Gtk.Align.CENTER}
        $={(self: Gtk.Entry) => { alarmEntry = self }}
      />
      <label cssName="alarm-status" label={statusLabel} halign={Gtk.Align.CENTER} />
      <button
        cssName="timer-btn"
        halign={Gtk.Align.CENTER}
        $={(self: Gtk.Button) => {
          self.connect("clicked", () => {
            if (alarmStatus() === "set") {
              setAlarmTarget("")
              setAlarmStatus("idle")
            } else {
              const raw = alarmEntry?.get_text().trim() ?? ""
              if (!/^\d{2}:\d{2}$/.test(raw)) return
              setAlarmTarget(raw)
              setAlarmStatus("set")
            }
          })
        }}
      >
        <label label={setCancel} />
      </button>
    </box>
  )
}

// ── Popover builder ───────────────────────────────────────────────────────────
function buildClockPopover(): Gtk.Widget {
  const stack = new Gtk.Stack()
  stack.set_transition_type(Gtk.StackTransitionType.SLIDE_LEFT_RIGHT)

  const timerPage = (<TimerTab />) as Gtk.Widget
  const alarmPage = (<AlarmTab />) as Gtk.Widget

  stack.add_named(timerPage, "timer")
  stack.add_named(alarmPage, "alarm")

  const timerStackPage = stack.get_page(timerPage)
  const alarmStackPage = stack.get_page(alarmPage)
  if (timerStackPage) timerStackPage.set_title("Timer")
  if (alarmStackPage) alarmStackPage.set_title("Alarm")

  const switcher = new Gtk.StackSwitcher()
  switcher.set_stack(stack)

  const outer = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 8 })
  outer.set_css_name("clock-popover")
  outer.append(switcher)
  outer.append(stack)
  return outer
}

// ── ClockDisplay ──────────────────────────────────────────────────────────────
function ClockDisplay({ time }: { time: string }) {
  return (
    <box cssName="clock" orientation={0} spacing={11}>
      <label cssName="clock-icon" label={CLOCK_ICON} />
      <label cssName="clock-time" label={time} />
    </box>
  )
}

// ── Clock default export ──────────────────────────────────────────────────────
export default function Clock() {
  return (
    <button
      cssName="clock-button"
      $={(self: Gtk.Button) => {
        const popover = new Gtk.Popover()
        popover.set_child(buildClockPopover())
        popover.set_parent(self)
        self.connect("clicked", () => popover.popup())
      }}
    >
      <ClockDisplay time={time} />
    </button>
  )
}
