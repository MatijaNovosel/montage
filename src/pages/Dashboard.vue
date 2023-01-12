<template>
  <div
    class="w-full flex text-white"
    style="height: calc(100% - var(--timeline-height-full))"
  >
    <sidebar class="w-3/12" />
    <div
      class="main w-7/12 h-full flex flex-col justify-center items-center relative"
    >
      <div class="top-left flex flex-col" v-if="memory">
        <div>
          <span class="text-slate-500 font-bold">Used</span>
          {{ bytesToMB(memory.usedJSHeapSize) }}
        </div>
        <div>
          <span class="text-slate-500 font-bold">Allocated</span>
          {{ bytesToMB(memory.totalJSHeapSize) }}
        </div>
        <div>
          <span class="text-slate-500 font-bold">Limit</span>
          {{ bytesToMB(memory.jsHeapSizeLimit) }}
        </div>
      </div>
      <div class="top-right flex flex-col">
        <div class="flex">
          <btn class="mr-2" @click="undo" background-color="slate-700">
            <img class="mr-2" src="/undo.svg" /> Undo
          </btn>
          <btn>
            <img class="scale-x-n1 mr-2" src="/undo.svg" />
            Redo
          </btn>
        </div>
        <div class="mt-3 flex justify-end">Zoom: {{ zoomLevel }}</div>
      </div>
      <main ref="main" class="h-full w-full">
        <canvas class="block" ref="canvas" />
      </main>
    </div>
    <layout class="w-2/12" />
  </div>
  <div
    class="flex bg-slate-900 text-white border-y border-slate-700"
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
    <div class="flex justify-center items-center w-3/12">
      <slider class="mr-3" v-model="timelineScale" />
      <m-select
        background-color="slate-900"
        placement="top-start"
        placeholder="Speed"
        :options="timeOptions"
        v-model="playbackSpeed"
      />
    </div>
    <div class="flex justify-center items-center w-6/12">
      <span class="mr-5"> 00:00:00 </span>
      <img class="cursor-pointer scale-x-n1" src="/timeline/ff.svg" />
      <img class="mx-5 cursor-pointer" src="/timeline/play.svg" />
      <img class="cursor-pointer" src="/timeline/ff.svg" />
    </div>
    <div class="flex justify-end items-center w-3/12">
      <btn @click="save" background-color="indigo-400"> Save </btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onKeyDown,
  useElementSize,
  useEventListener,
  useMemory
} from "@vueuse/core";
import { fabric } from "fabric";
import { storeToRefs } from "pinia";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Layout from "../components/dashboard/layout/layout.vue";
import Sidebar from "../components/dashboard/sidebar/sidebar.vue";
import { SelectItem } from "../models/common";
import { useDashboardStore } from "../store/dashboard";
import { useToastStore } from "../store/toast";
import { initializeFabric } from "../utils/fabric";
import { bytesToMB } from "../utils/helpers";

const dashboardStore = useDashboardStore();
const { createToast } = useToastStore();

const { newObj, artboardColor, artboardHeight, artboardWidth } =
  storeToRefs(dashboardStore);

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
const zoomLevel = ref("100%");

let fabricCanvas: fabric.Canvas | null = null;
let artBoard: fabric.Rect | null = null;

const { width, height } = useElementSize(main);
const { memory } = useMemory();

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
      artBoard.left = width / 2 - parseInt(artboardWidth.value) / 2;
      artBoard.top = height / 2 - parseInt(artboardHeight.value) / 2;
    }

    fabricCanvas?.renderAll();
  });
});

watch(artboardColor, (val) => {
  fabricCanvas?.setBackgroundColor(val, () => {});
  fabricCanvas?.renderAll();
});

watch([artboardHeight, artboardWidth], ([heightA, widthA]) => {
  if (artBoard) {
    artBoard.width = parseInt(widthA);
    artBoard.height = parseInt(heightA);
    artBoard.left = width.value / 2 - parseInt(widthA) / 2;
    artBoard.top = height.value / 2 - parseInt(heightA) / 2;
    fabricCanvas?.renderAll();
  }
});

watch(newObj, (val) => {
  fabric.loadSVGFromURL(`/emojis/${val?.name}.svg`, (objects, options) => {
    const svgData = fabric.util.groupSVGElements(objects, options);
    svgData.top = height.value / 2;
    svgData.left = width.value / 2;
    fabricCanvas?.add(svgData);
    fabricCanvas?.setActiveObject(svgData);
  });
});

onKeyDown("Delete", () => {
  fabricCanvas?.getActiveObjects().forEach((obj) => fabricCanvas?.remove(obj));
  fabricCanvas?.discardActiveObject().renderAll();
});

const wheelScrollEvent = useEventListener(document, "wheel", (e) => {
  const scrollingUp = Math.sign(e.deltaY) < 0; // Down = 1, Up = -1
  if (fabricCanvas) {
    let zoom = fabricCanvas.getZoom() + (scrollingUp ? 0.02 : -0.02);
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    fabricCanvas.setZoom(1);
    fabricCanvas.renderAll();
    const vpw = width.value / zoom;
    const vph = height.value / zoom;
    const x = artBoard?.left || 0 + parseInt(artboardWidth.value) / 2 - vpw / 2;
    const y = artBoard?.top || 0 + parseInt(artboardHeight.value) / 2 - vph / 2;
    fabricCanvas.absolutePan({ x, y });
    fabricCanvas.setZoom(zoom);
    fabricCanvas.renderAll();
    zoomLevel.value = `${(fabricCanvas.getZoom() * 100).toFixed(0)}%`;
  }
});

onMounted(async () => {
  fabricCanvas = initializeFabric(
    canvas.value as HTMLCanvasElement,
    width.value,
    height.value,
    artboardColor.value
  );

  artBoard = new fabric.Rect({
    left: width.value / 2 - parseInt(artboardWidth.value) / 2,
    top: height.value / 2 - parseInt(artboardHeight.value) / 2,
    width: parseInt(artboardWidth.value),
    height: parseInt(artboardHeight.value),
    absolutePositioned: true,
    rx: 0,
    ry: 0,
    hasControls: true,
    transparentCorners: false,
    borderColor: "#0E98FC",
    cornerColor: "#0E98FC"
  });

  fabricCanvas.renderAll();
  fabricCanvas.clipPath = artBoard;
  fabricCanvas.renderAll();

  fabricCanvas.on("object:moving", function (e) {
    //
  });

  createToast("✅ App successfully started!", "#4BB543");
});

onBeforeUnmount(() => {
  wheelScrollEvent();
});
</script>

<style scoped>
.top-left {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
}

.top-right {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
}
</style>
