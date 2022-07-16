import { store } from "quasar/wrappers";
import { InjectionKey } from "vue";
import { createStore, Store as VuexStore, useStore as vuexUseStore } from "vuex";
import app from "./app";
import { AppStateInterface } from "./app/state";

export interface StateInterface {
  app: AppStateInterface;
}

export interface Getters {
  "app/currentProjectTitle": string;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>;
  }
}

export const storeKey: InjectionKey<VuexStore<StateInterface>> = Symbol("vuex-key");

export default store(function () {
  const Store = createStore<StateInterface>({
    modules: {
      app
    },
    strict: !!process.env.DEBUGGING
  });

  return Store;
});

export function useStore() {
  return vuexUseStore(storeKey);
}
