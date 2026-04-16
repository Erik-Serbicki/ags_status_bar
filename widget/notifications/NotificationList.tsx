import Notifd from "gi://AstalNotifd"
import { createState, For } from "ags"
import { Gtk } from "ags/gtk4"

const notifd = Notifd.get_default()
const [notifications, setNotifications] = createState(notifd.get_notifications())

notifd.connect("notified", () => setNotifications(notifd.get_notifications()))
notifd.connect("resolved", () => setNotifications(notifd.get_notifications()))

export function NotificationsSection() {
  return (
    <box cssName="qs-section" orientation={1} spacing={8}>
      <box cssName="notifications-header" orientation={0}>
        <label cssName="qs-section-title" label="NOTIFICATIONS" hexpand={true} halign={Gtk.Align.START} />
        <button cssName="notifications-clear-btn" onClicked={() => notifications().forEach((n) => n.dismiss())}>
          <label label="Clear all" />
        </button>
      </box>
      <label
        cssName="notifications-empty"
        label="No notifications"
        visible={() => notifications().length === 0}
        halign={Gtk.Align.CENTER}
      />
      <box
        cssName="notification-list"
        orientation={1}
        spacing={4}
        visible={() => notifications().length > 0}
      >
        <For each={notifications}>
          {(n) => (
            <box cssName="notification-item" orientation={1} spacing={2}>
              <box cssName="notification-item-header" orientation={0} spacing={8}>
                <image cssName="notification-item-icon" iconName={n.appIcon} iconSize={Gtk.IconSize.NORMAL} />
                <label cssName="notification-item-app-name" label={n.appName} hexpand={true} halign={Gtk.Align.START} />
                <button cssName="notification-item-dismiss" onClicked={() => n.dismiss()}>
                  <label label="✕" />
                </button>
              </box>
              <label cssName="notification-item-summary" label={n.summary} halign={Gtk.Align.START} />
              {n.body
                ? <label cssName="notification-item-body" label={n.body} halign={Gtk.Align.START} wrap={true} />
                : <box />}
            </box>
          )}
        </For>
      </box>
    </box>
  )
}
