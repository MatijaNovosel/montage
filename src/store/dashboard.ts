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
  const artboardColor = ref("#000000");
  const artboardHeight = ref("450");
  const artboardWidth = ref("800");

  const artHeight = computed(() => parseInt(artboardHeight.value) || 0);
  const artWidth = computed(() => parseInt(artboardWidth.value) || 0);

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

  const setArtboardColor = (color: string) => {
    artboardColor.value = color;
  };

  const setArtboardDimensions = (width?: string, height?: string) => {
    if (width) artboardWidth.value = width;
    if (height) artboardHeight.value = height;
  };

  return {
    activeTab,
    setActiveTab,
    activeTabComponent,
    addObject,
    newObj,
    setArtboardColor,
    artboardColor,
    artHeight,
    artWidth,
    setArtboardDimensions
  };
});
