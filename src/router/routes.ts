import { RouteRecordRaw } from "vue-router";
import ROUTE_NAMES from "./routeNames";

const routes: RouteRecordRaw[] = [
  {
    path: "",
    name: ROUTE_NAMES.DASHBOARD,
    component: () => import("../pages/Dashboard.vue")
  },
  {
    path: "/editor",
    name: ROUTE_NAMES.EDITOR,
    component: () => import("../pages/Editor.vue")
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("../pages/Error404.vue")
  }
];

export default routes;
