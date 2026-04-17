import { createPoll } from "ags/time"
import { createComputed } from "ags"
import GLib from "gi://GLib"

let prevIdle = 0
let prevTotal = 0

function getCpuUsage(): number {
  try {
    const [ok, bytes] = GLib.file_get_contents("/proc/stat")
    if (!ok) return 0
    const line = new TextDecoder().decode(bytes).split("\n")[0]
    // fields: cpu user nice system idle iowait irq softirq steal ...
    const parts = line.trim().split(/\s+/).slice(1).map(Number)
    const idle = parts[3] + (parts[4] ?? 0) // idle + iowait
    const total = parts.reduce((a, b) => a + b, 0)
    const deltaIdle = idle - prevIdle
    const deltaTotal = total - prevTotal
    prevIdle = idle
    prevTotal = total
    if (deltaTotal === 0) return 0
    return Math.round((1 - deltaIdle / deltaTotal) * 100)
  } catch {
    return 0
  }
}

function getCpuIcon(pct: number): string {
  if (pct < 13) return "▁"
  if (pct < 25) return "▂"
  if (pct < 38) return "▃"
  if (pct < 50) return "▄"
  if (pct < 63) return "▅"
  if (pct < 75) return "▆"
  if (pct < 88) return "▇"
  return "█"
}

export default function CpuWidget() {
  const usage = createPoll(getCpuUsage(), 2000, getCpuUsage)
  const icon = createComputed(() => getCpuIcon(usage()))
  const cssClass = createComputed(() =>
    usage() >= 80 ? "cpu high" : "cpu"
  )

  return (
    <box cssName="cpu-widget" class={cssClass} orientation={0} spacing={4}>
      <label cssName="cpu-percent" label={createComputed(() => `${usage()}%`)} />
      <label cssName="cpu-icon" label={icon} />
    </box>
  )
}
