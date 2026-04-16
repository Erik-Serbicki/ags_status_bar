import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import { toggleQuickSettings } from "./widget/utilities/QuickSettings"
import { toggleRunMenu } from "./widget/run_menu/RunMenu"

app.start({
  css: style,
  main() {
    app.get_monitors().map(Bar)
  },
  requestHandler(argv, res) {
    console.log("request received:", argv)
    if (argv[0] === "toggle-quick-settings") {
      toggleQuickSettings()
      res("ok")
    } else if (argv[0] === "toggle-run-menu") {
      toggleRunMenu()
      res("ok")
    } else {
      res(`unknown request: ${argv[0]}`)
    }
  },
})
