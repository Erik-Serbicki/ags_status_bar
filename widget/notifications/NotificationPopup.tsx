import Notifd from "gi://AstalNotifd"
import GLib from "gi://GLib"
import { createState, createComputed, For } from "ags"
import { Gtk, Astal } from "ags/gtk4"
import app from "ags/gtk4/app"

const notifd = Notifd.get_default()
const [toastIds, setToastIds] = createState<number[]>([])

notifd.connect("notified", (_: unknown, id: number) => {
  if (notifd.dontDisturb) return
  setToastIds((ids) => [...ids, id])
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
    setToastIds((ids) => ids.filter((i) => i !== id))
    return false
  })
})

notifd.connect("resolved", (_: unknown, id: number) => {
  setToastIds((ids) => ids.filter((i) => i !== id))
})

const { TOP, RIGHT } = Astal.WindowAnchor

export function setupNotificationPopups() {
  const popupVisible = createComputed(() => toastIds().length > 0)

  ;(
    <window
      name="notification-popups"
      class="NotificationPopups"
      visible={popupVisible}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.NONE}
      anchor={TOP | RIGHT}
      application={app}
      marginTop={40}
      marginRight={8}
    >
      <box cssName="notification-popup-list" orientation={1} spacing={8}>
        <For each={toastIds}>
          {(id: number) => {
            const n = notifd.get_notification(id)
            if (!n) return <box />
            return (
              <box cssName="notification-popup" orientation={1} spacing={4}>
                <box cssName="notification-popup-header" orientation={0} spacing={8}>
                  <image cssName="notification-popup-icon" iconName={n.appIcon} iconSize={Gtk.IconSize.NORMAL} />
                  <label cssName="notification-popup-app-name" label={n.appName} hexpand={true} halign={Gtk.Align.START} />
                  <button cssName="notification-popup-close" onClicked={() => n.dismiss()}>
                    <label label="✕" />
                  </button>
                </box>
                <label cssName="notification-popup-summary" label={n.summary} halign={Gtk.Align.START} />
                {n.body
                  ? <label cssName="notification-popup-body" label={n.body} halign={Gtk.Align.START} wrap={true} />
                  : <box />}
              </box>
            )
          }}
        </For>
      </box>
    </window>
  ) as Astal.Window
}
