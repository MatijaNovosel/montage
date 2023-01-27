import { defineStore } from "pinia";
import { computed, defineAsyncComponent, ref } from "vue";
import { TABS } from "../utils/constants";

export const useDashboardStore = defineStore("dashboard", () => {
  const activeTab = ref(TABS.OBJECTS);

  const artboardColor = ref("#000000");
  const artboardHeight = ref(450);
  const artboardWidth = ref(800);

  const activeObjectWidth = ref("0");
  const activeObjectHeight = ref("0");
  const activeObjectRotation = ref("0");
  const activeObjectOpacity = ref(0);

  const activeObject = ref<fabric.Object | null | undefined>(null);

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

  const setArtboardDimensions = (width?: number, height?: number) => {
    if (width) artboardWidth.value = width;
    if (height) artboardHeight.value = height;
  };

  const setActiveObject = (obj: fabric.Object | null | undefined) => {
    activeObject.value = obj;
  };

  const setActiveObjectWidth = (width: number) => {
    activeObjectWidth.value = width.toFixed(2);
  };

  const setActiveObjectHeight = (height: number) => {
    activeObjectHeight.value = height.toFixed(2);
  };

  const setActiveObjectRotation = (rotation: number) => {
    activeObjectRotation.value = rotation.toString();
  };

  const setActiveObjectOpacity = (opacity: number) => {
    activeObjectOpacity.value = opacity;
    activeObject.value?.set("opacity", opacity);
  };

  return {
    activeTab,
    setActiveTab,
    activeTabComponent,
    setArtboardColor,
    artboardColor,
    artboardHeight,
    artboardWidth,
    setArtboardDimensions,
    activeObject,
    setActiveObject,
    activeObjectId,
    activeObjectWidth,
    activeObjectHeight,
    setActiveObjectWidth,
    setActiveObjectHeight,
    activeObjectRotation,
    setActiveObjectRotation,
    activeObjectOpacity,
    setActiveObjectOpacity
  };
});
