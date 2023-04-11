import FloatingVue from "floating-vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import WebFont from "webfontloader";
import App from "./App.vue";
import btn from "./components/app/btn.vue";
import colorPicker from "./components/app/colorPicker.vue";
import mSelect from "./components/app/mSelect.vue";
import slider from "./components/app/slider.vue";
import textInput from "./components/app/textInput.vue";
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

WebFont.load({
  google: {
    families: ["Roboto"]
  }
});

// Vuetify
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

const vuetify = createVuetify({
  components,
  directives
});

app.use(router);
app.use(i18n);
app.use(pinia);
app.use(vuetify);
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
app.component("text-input", textInput);
app.component("slider", slider);
app.component("color-picker", colorPicker);
app.component("btn", btn);

app.mount("#app");
