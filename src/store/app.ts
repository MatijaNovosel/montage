import { defineStore } from "pinia";
import { ref } from "vue";
import { TABS } from "../utils/constants";

export const useAppStore = defineStore("app", () => {
  const activeTab = ref<number>(TABS.UPLOADS);

  const setActiveTab = (tab: number) => {
    activeTab.value = tab;
  };

  return {
    activeTab,
    setActiveTab
  };
});
