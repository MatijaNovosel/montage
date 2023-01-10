import { defineStore } from "pinia";
import { computed, defineAsyncComponent, ref } from "vue";
import { TABS } from "../utils/constants";

export interface NewObject {
  type: string;
  name: string;
}

export const useDashboardStore = defineStore("dashboard", () => {
  const activeTab = ref<number>(TABS.OBJECTS);
  const newObj = ref<NewObject | null>(null);

  const activeTabComponent = computed(() => {
    switch (activeTab.value) {
      case TABS.OBJECTS:
        return defineAsyncComponent(
          () => import("../components/dashboard/sidebar/tabs/objects.vue")
        );
      case TABS.AUDIO:
        return defineAsyncComponent(
          () => import("../components/dashboard/sidebar/tabs/audio.vue")
        );
      case TABS.UPLOADS:
        return defineAsyncComponent(
          () => import("../components/dashboard/sidebar/tabs/uploads.vue")
        );
      case TABS.TEXT:
        return defineAsyncComponent(
          () => import("../components/dashboard/sidebar/tabs/text.vue")
        );
      case TABS.VIDEOS:
        return defineAsyncComponent(
          () => import("../components/dashboard/sidebar/tabs/videos.vue")
        );
      case TABS.IMAGES:
        return defineAsyncComponent(
          () => import("../components/dashboard/sidebar/tabs/images.vue")
        );
      default:
        return defineAsyncComponent(
          () => import("../components/dashboard/sidebar/tabs/objects.vue")
        );
    }
  });

  const setActiveTab = (tab: number) => {
    activeTab.value = tab;
  };

  const addObject = (object: string) => {
    newObj.value = {
      type: "emoji",
      name: object
    };
  };

  return {
    activeTab,
    setActiveTab,
    activeTabComponent,
    addObject,
    newObj
  };
});
