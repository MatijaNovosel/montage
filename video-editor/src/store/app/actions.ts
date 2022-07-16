import { ActionTree } from "vuex";
import { StateInterface } from "../index";
import { AppStateInterface } from "./state";

const actions: ActionTree<AppStateInterface, StateInterface> = {
  someAction() {}
};

export default actions;
