import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Workspaces from "./desktop/Workspaces"
import Clock from "./calendar/Clock"
import Calendar from "./calendar/Calendar"
import SystemTray from "./utilities/Tray"
import NetworkWidget from "./utilities/Network"
import AudioWidget from "./utilities/Audio"
import BatteryWidget from "./utilities/Battery"
import PowerButton from "./utilities/PowerButton"
import { SettingsButton } from "./utilities/QuickSettings"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <box $type="start">
            <Workspaces />
        </box>
        <box $type="center" spacing={12}>
            <Calendar />
            <Clock />
        </box>
        <box $type="end" >
            <SystemTray />
            <AudioWidget />
            <NetworkWidget />
            <BatteryWidget />
            <SettingsButton />
            <PowerButton />
        </box>
      </centerbox>
    </window>
  )
}
