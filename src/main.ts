import FloatingVue from "floating-vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import en from "./i18n/en";
import hr from "./i18n/hr";
import router from "./router";

import "floating-vue/dist/style.css";
import "./index.css";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    hr
  }
});

const pinia = createPinia();

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(pinia);
app.use(FloatingVue, {
  themes: {
    "info-tooltip": {
      $extend: "tooltip",
      $resetCss: true
    }
  }
});

app.mount("#app");
