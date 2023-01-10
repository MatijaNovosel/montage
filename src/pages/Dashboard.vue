<template>
  <div
    class="w-full flex text-white"
    style="height: calc(100% - var(--timeline-height))"
  >
    <sidebar class="w-3/12" />
    <div
      class="main w-7/12 h-full flex flex-col justify-center items-center relative"
    >
      <button
        @click="undo"
        class="px-3 bg-slate-700 hover:bg-slate-600 rounded-md py-1 flex justify-center items-center undo-btn z-10"
      >
        <img class="mr-2" src="/undo.svg" /> Undo
      </button>
      <button
        class="px-3 bg-slate-600 hover:bg-slate-500 rounded-md py-1 flex justify-center items-center redo-btn z-10"
      >
        <img class="mr-2 scale-x-n1" src="/undo.svg" />
        Redo
      </button>
      <main ref="main" class="h-full w-full">
        <canvas class="block" ref="canvas" />
      </main>
    </div>
    <layout class="w-2/12" />
  </div>
  <div
    class="flex justify-between items-center bg-slate-800 text-white px-5"
    style="height: var(--timeline-height)"
  >
    <div>Range</div>
    <div class="flex">
      <img class="cursor-pointer scale-x-n1" src="/timeline/ff.svg" />
      <img class="mx-5 cursor-pointer" src="/timeline/play.svg" />
      <img class="cursor-pointer" src="/timeline/ff.svg" />
    </div>
    <button class="px-4 bg-indigo-400 hover:bg-indigo-300 rounded-md py-1">
      Save
    </button>
  </div>
</template>

<script setup lang="ts">
import { onKeyDown, useElementSize } from "@vueuse/core";
import { fabric } from "fabric";
import { storeToRefs } from "pinia";
import { nextTick, onMounted, ref, watch } from "vue";
import Layout from "../components/dashboard/layout/layout.vue";
import Sidebar from "../components/dashboard/sidebar/sidebar.vue";
import { useDashboardStore } from "../store/dashboard";
import { useToastStore } from "../store/toast";

const dashboardStore = useDashboardStore();
const { createToast } = useToastStore();

const { newObj } = storeToRefs(dashboardStore);

const canvas = ref<HTMLCanvasElement | null>(null);
const main = ref<HTMLElement | null>(null);
let fabricCanvas: fabric.Canvas | null = null;

const { width, height } = useElementSize(main);

const undo = () => {
  createToast("🚨 Undo", "#f80000");
};

watch([width, height], async (val) => {
  const [width, height] = val;
  await nextTick(() => {
    fabricCanvas?.setHeight(height);
    fabricCanvas?.setWidth(width);
    fabricCanvas?.renderAll();
  });
});

watch(newObj, (val) => {
  fabric.loadSVGFromURL(`/emojis/${val?.name}.svg`, (objects, options) => {
    const svgData = fabric.util.groupSVGElements(objects, options);
    svgData.top = 30;
    svgData.left = 50;
    fabricCanvas?.add(svgData);
  });
});

onKeyDown("Delete", () => {
  fabricCanvas?.getActiveObjects().forEach((obj) => fabricCanvas?.remove(obj));
  fabricCanvas?.discardActiveObject().renderAll();
});

onMounted(() => {
  fabricCanvas = new fabric.Canvas(canvas.value, {
    width: width.value,
    height: height.value,
    backgroundColor: "#000000"
  });
  createToast("✅ App successfully started!", "#4BB543");
});
</script>

<style scoped>
.undo-btn {
  position: absolute;
  top: 15px;
  left: 15px;
}

.redo-btn {
  position: absolute;
  top: 15px;
  left: 110px;
}
</style>
