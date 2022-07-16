import { Module } from "vuex";
import { StateInterface } from "../index";
import state, { AppStateInterface } from "./state";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";

const appModule: Module<AppStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
};

export default appModule;
