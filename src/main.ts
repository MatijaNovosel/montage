import FloatingVue from "floating-vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import colorPicker from "./components/app/colorPicker.vue";
import mSelect from "./components/app/mSelect.vue";
import mTextInput from "./components/app/mTextInput.vue";
import slider from "./components/app/slider.vue";
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

// Global components
app.component("m-select", mSelect);
app.component("m-text-input", mTextInput);
app.component("slider", slider);
app.component("color-picker", colorPicker);

app.mount("#app");
