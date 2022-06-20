import { route } from "quasar/wrappers";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router";
import { StateInterface } from "../store";
import routes from "./routes";

export default route<StateInterface>(function () {
  let createHistory = null;

  if (process.env.SERVER) {
    createHistory = createMemoryHistory;
  } else {
    if (process.env.VUE_ROUTER_MODE === "history") {
      createHistory = createWebHistory;
    } else {
      createHistory = createWebHashHistory;
    }
  }

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(
      process.env.MODE === "ssr" ? void 0 : process.env.VUE_ROUTER_BASE
    )
  });

  return Router;
});
