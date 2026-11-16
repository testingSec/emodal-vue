import "bootstrap/dist/css/bootstrap.min.css";
import "../index";
import { createApp } from "vue";
import App from "./App.vue";

createApp(App)
  .provide(
    "emodal-lab-context",
    "Este valor viene del provide del playground independiente."
  )
  .mount("#app");
