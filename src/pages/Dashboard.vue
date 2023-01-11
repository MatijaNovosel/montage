<template>
  <div
    class="w-full flex text-white"
    style="height: calc(100% - var(--timeline-height-full))"
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
    class="flex bg-slate-900 text-white px-5 border-y border-slate-700"
    style="height: var(--timeline-height)"
  >
    <div class="w-4/12 border-r border-slate-700 h-full p-5">
      Keyframes & layers
    </div>
    <div class="w-8/12 h-full p-5">Draggable timeline</div>
  </div>
  <div
    class="flex justify-between items-center bg-slate-800 text-white px-5"
    style="height: var(--timeline-controls-height)"
  >
    <div class="flex justify-center items-center w-4/12">
      <slider class="mr-3" v-model="timelineScale" />
      <m-select
        background-color="slate-900"
        placement="top-start"
        placeholder="Speed"
        :options="timeOptions"
        v-model="playbackSpeed"
      />
    </div>
    <div class="flex w-4/12">
      <span class="mr-5"> 00:00:00 </span>
      <img class="cursor-pointer scale-x-n1" src="/timeline/ff.svg" />
      <img class="mx-5 cursor-pointer" src="/timeline/play.svg" />
      <img class="cursor-pointer" src="/timeline/ff.svg" />
    </div>
    <div>
      <button
        @click="save"
        class="px-4 bg-indigo-400 hover:bg-indigo-300 rounded-md py-1"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onKeyDown, useElementSize } from "@vueuse/core";
import { fabric } from "fabric";
import { storeToRefs } from "pinia";
import { nextTick, onMounted, ref, watch } from "vue";
import Layout from "../components/dashboard/layout/layout.vue";
import Sidebar from "../components/dashboard/sidebar/sidebar.vue";
import { SelectItem } from "../models/common";
import { useDashboardStore } from "../store/dashboard";
import { useToastStore } from "../store/toast";
import { initializeFabric } from "../utils/fabric";

const dashboardStore = useDashboardStore();
const { createToast } = useToastStore();

const { newObj } = storeToRefs(dashboardStore);

const ARTBOARD_WIDTH = 800;
const ARTBOARD_HEIGHT = 450;

const timeOptions: SelectItem<number>[] = [
  {
    text: "0.5x",
    value: 1
  },
  {
    text: "1x",
    value: 2
  },
  {
    text: "1.5x",
    value: 3
  },
  {
    text: "2x",
    value: 4
  }
];

const playbackSpeed = ref<SelectItem<number> | null>(timeOptions[1]);

const canvas = ref<HTMLCanvasElement | null>(null);
const main = ref<HTMLElement | null>(null);
const timelineScale = ref(0);

let fabricCanvas: fabric.Canvas | null = null;
let artBoard: fabric.Rect | null = null;

const { width, height } = useElementSize(main);

const undo = () => {
  createToast("🚨 Undo", "#f80000");
};

const save = () => {
  createToast("💾 Saved", "#2171b3");
};

watch([width, height], async (val) => {
  const [width, height] = val;
  await nextTick(() => {
    fabricCanvas?.setHeight(height);
    fabricCanvas?.setWidth(width);

    if (artBoard) {
      artBoard.left = width / 2 - ARTBOARD_WIDTH / 2;
      artBoard.top = height / 2 - ARTBOARD_HEIGHT / 2;
    }

    fabricCanvas?.renderAll();
  });
});

watch(newObj, (val) => {
  fabric.loadSVGFromURL(`/emojis/${val?.name}.svg`, (objects, options) => {
    const svgData = fabric.util.groupSVGElements(objects, options);
    svgData.top = 100;
    svgData.left = 100;
    fabricCanvas?.add(svgData);
    fabricCanvas?.setActiveObject(svgData);
  });
});

onKeyDown("Delete", () => {
  fabricCanvas?.getActiveObjects().forEach((obj) => fabricCanvas?.remove(obj));
  fabricCanvas?.discardActiveObject().renderAll();
});

onMounted(async () => {
  fabricCanvas = initializeFabric(
    canvas.value as HTMLCanvasElement,
    width.value,
    height.value
  );

  artBoard = new fabric.Rect({
    left: width.value / 2 - ARTBOARD_WIDTH / 2,
    top: height.value / 2 - ARTBOARD_HEIGHT / 2,
    width: ARTBOARD_WIDTH,
    height: ARTBOARD_HEIGHT,
    absolutePositioned: true,
    rx: 0,
    ry: 0,
    fill: "#FFF",
    hasControls: true,
    transparentCorners: false,
    borderColor: "#0E98FC",
    cornerColor: "#0E98FC"
  });

  fabricCanvas.renderAll();
  fabricCanvas.clipPath = artBoard;
  fabricCanvas.renderAll();

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
