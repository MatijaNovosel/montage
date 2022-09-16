import { createApp } from "vue";
import App from "./App.vue";
import Toast from "vue-toastification";
import router from "./router";
import hr from "./i18n/hr";
import en from "./i18n/en";

import "./index.css";
import "vue-toastification/dist/index.css";
import { createI18n } from "vue-i18n";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    hr
  }
});

const app = createApp(App);

app.use(router);
app.use(Toast, {});
app.use(i18n);

app.mount("#app");
