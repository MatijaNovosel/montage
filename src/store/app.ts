import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const activeTab = ref<number>(0);

  const setActiveTab = (tab: number) => {
    activeTab.value = tab;
  };

  return {
    activeTab,
    setActiveTab
  };
});
