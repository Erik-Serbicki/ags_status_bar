import { createBinding, createComputed } from "ags"
import Battery from "gi://AstalBattery"

const battery = Battery.get_default()

function getBatteryIcon(percent: number, charging: boolean): string {
  if (charging) {
    if (percent < 10) return "󰢜"
    if (percent < 20) return "󰂆"
    if (percent < 30) return "󰂇"
    if (percent < 40) return "󰂈"
    if (percent < 50) return "󰢝"
    if (percent < 60) return "󰂉"
    if (percent < 70) return "󰢞"
    if (percent < 80) return "󰂊"
    if (percent < 90) return "󰂋"
    return "󰂅"
  }
  if (percent < 10) return "󰁺"
  if (percent < 20) return "󰁻"
  if (percent < 30) return "󰁼"
  if (percent < 40) return "󰁽"
  if (percent < 50) return "󰁾"
  if (percent < 60) return "󰁿"
  if (percent < 70) return "󰂀"
  if (percent < 80) return "󰂁"
  if (percent < 90) return "󰂂"
  return "󰁹"
}

export default function BatteryWidget() {
  const percentRaw = createBinding(battery, "percentage")
  const charging = createBinding(battery, "charging")

  const percent = createComputed(() => Math.round(percentRaw() * 100))
  const icon = createComputed(() => getBatteryIcon(percent(), charging()))
  const cssClass = createComputed(() => {
    const classes = ["battery"]
    if (percent() < 20 && !charging()) classes.push("low")
    return classes.join(" ")
  })

  return (
    <box class={cssClass} orientation={0} spacing={4}>
      <label cssName="battery-icon" label={icon} />
      <label cssName="battery-percent" label={createComputed(() => `${percent()}%`)} />
    </box>
  )
}
