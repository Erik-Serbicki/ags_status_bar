import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { toggleQuickSettings } from "./widget/utilities/QuickSettings"

app.start({
  css: style,
  main() {
    app.get_monitors().map(Bar)
  },
  requestHandler(request, res) {
    if (request === "toggle-quick-settings") {
      toggleQuickSettings()
      res("ok")
    }
  },
})
