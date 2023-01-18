import { defineStore } from "pinia";
import { computed, defineAsyncComponent, ref } from "vue";
import { TABS } from "../utils/constants";

export const useDashboardStore = defineStore("dashboard", () => {
  const activeTab = ref(TABS.OBJECTS);
  const artboardColor = ref("#000000");
  const artboardHeight = ref("450");
  const artboardWidth = ref("800");
  const activeObject = ref<fabric.Object | null>(null);

  const artBoardHeight = computed(() => parseInt(artboardHeight.value) || 0);
  const artBoardWidth = computed(() => parseInt(artboardWidth.value) || 0);

  const activeObjectId = computed(() => {
    if (activeObject.value) {
      //@ts-ignore
      return activeObject.value.id;
    }
  });

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

  const setArtboardColor = (color: string) => {
    artboardColor.value = color;
  };

  const setArtboardDimensions = (width?: string, height?: string) => {
    if (width) artboardWidth.value = width;
    if (height) artboardHeight.value = height;
  };

  const setActiveObject = (obj: fabric.Object | null | undefined) => {
    if (obj) {
      activeObject.value = obj;
    }
  };

  return {
    activeTab,
    setActiveTab,
    activeTabComponent,
    setArtboardColor,
    artboardColor,
    artBoardHeight,
    artBoardWidth,
    setArtboardDimensions,
    activeObject,
    setActiveObject,
    activeObjectId
  };
});
