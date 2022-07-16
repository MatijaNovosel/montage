import { GetterTree } from "vuex";
import { StateInterface } from "../index";
import { AppStateInterface } from "./state";

const getters: GetterTree<AppStateInterface, StateInterface> = {
  currentProjectTitle(state: AppStateInterface) {
    return state.currentProjectTitle;
  }
};

export default getters;
