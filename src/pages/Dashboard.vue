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
    <layout @align="alignActiveObject" class="w-2/12" />
  </div>
  <div
    class="flex bg-slate-900 text-white border-y border-slate-700"
    style="height: var(--timeline-height)"
  >
    <div class="w-4/12 border-r border-slate-700 h-full p-5">
      <div>Layers</div>
      <div class="text-slate-500 mt-3">
        {{ layers.length ? "Layers" : "No layers added." }}
      </div>
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
import { Layer, SelectItem } from "../models/common";
import { useDashboardStore } from "../store/dashboard";
import { useToastStore } from "../store/toast";
import { ALIGN_OPTIONS } from "../utils/constants";
import { initializeFabric } from "../utils/fabric";
import { bytesToMB } from "../utils/helpers";

const dashboardStore = useDashboardStore();
const { createToast } = useToastStore();

const { newObj, artboardColor, artWidth, artHeight } =
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
const layers = ref<Layer[]>([]);

let fabricCanvas: fabric.Canvas | null = null;
let artBoard: fabric.Rect | null = null;
let lineH: fabric.Line | null = null;
let lineV: fabric.Line | null = null;
let centerCircle: fabric.Circle | null = null;

const { width, height } = useElementSize(main);
const { memory } = useMemory();

const undo = () => {
  createToast("🚨 Undo", "#f80000");
};

const save = () => {
  createToast("💾 Saved", "#2171b3");
};

watch(artboardColor, (val) => {
  fabricCanvas?.setBackgroundColor(val, () => {});
  fabricCanvas?.renderAll();
});

watch([artHeight, artWidth], ([heightA, widthA]) => {
  artBoard!.width = widthA;
  artBoard!.height = heightA;
  artBoard!.left = width.value / 2 - widthA / 2;
  artBoard!.top = height.value / 2 - heightA / 2;
  fabricCanvas?.renderAll();
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

const getObjectById = (id: string) => {
  let object = null;
  const allObjects = fabricCanvas!.getObjects();
  for (let i = 0; i < fabricCanvas!.size(); i++) {
    if (allObjects[i].get("type") == "group") {
      //@ts-ignore
      if (allObjects[i].get("id") && allObjects[i].get("id") === id) {
        object = allObjects[i];
        break;
      }
      const wip = i;
      //@ts-ignore
      for (let o = 0; o < allObjects[i]._objects.length; o++) {
        if (
          //@ts-ignore
          allObjects[wip]._objects[o].id &&
          //@ts-ignore
          allObjects[wip]._objects[o].id === id
        ) {
          //@ts-ignore
          object = allObjects[wip]._objects[o];
          break;
        }
      }
      //@ts-ignore
    } else if (allObjects[i].id && allObjects[i].id === id) {
      object = allObjects[i];
      break;
    }
  }
  return object;
};

const initLines = () => {
  if (getObjectById("centerH")) {
    fabricCanvas!.remove(getObjectById("centerH"));
    fabricCanvas!.remove(getObjectById("centerV"));
  }

  if (getObjectById("lineH")) {
    fabricCanvas!.remove(getObjectById("lineH"));
    fabricCanvas!.remove(getObjectById("lineV"));
  }

  fabricCanvas!.add(
    new fabric.Line(
      [
        fabricCanvas!.getWidth() / 2,
        0,
        fabricCanvas!.getWidth() / 2,
        fabricCanvas!.getHeight()
      ],
      {
        opacity: 0,
        selectable: false,
        evented: false,
        //@ts-ignore
        id: "centerH"
      }
    )
  );

  fabricCanvas!.add(
    new fabric.Line(
      [
        0,
        fabricCanvas!.getHeight() / 2,
        fabricCanvas!.getWidth(),
        fabricCanvas!.getHeight() / 2
      ],
      {
        opacity: 0,
        selectable: false,
        evented: false,
        //@ts-ignore
        id: "centerV"
      }
    )
  );

  // Canvas alignemnt guides
  lineH = new fabric.Line(
    [
      fabricCanvas!.getWidth() / 2,
      artBoard!.top as number,
      fabricCanvas!.getWidth() / 2,
      artHeight.value + (artBoard!.top as number)
    ],
    {
      stroke: "#0E98FC",
      opacity: 0,
      selectable: false,
      evented: false,
      //@ts-ignore
      id: "lineH"
    }
  );

  lineV = new fabric.Line(
    [
      artBoard!.left as number,
      fabricCanvas!.getHeight() / 2,
      artWidth.value + (artBoard!.left as number),
      fabricCanvas!.getHeight() / 2
    ],
    {
      stroke: "#0E98FC",
      opacity: 0,
      selectable: false,
      evented: false,
      //@ts-ignore
      id: "lineV"
    }
  );

  fabricCanvas!.add(lineH);
  fabricCanvas!.add(lineV);
};

const checkHSnap = (
  a: number,
  b: number,
  snapZone: number,
  e: fabric.IEvent<MouseEvent>,
  type: number
) => {
  if (a > b - snapZone && a < b + snapZone) {
    const width = e.target?.get("height") as number;
    const scaleX = e.target?.get("scaleX") as number;
    lineH!.opacity = 1;
    lineH!.bringToFront();
    let value = b;
    if (type == 1) {
      value = b;
    } else if (type == 2) {
      value = b - (width * scaleX) / 2;
    } else if (type == 3) {
      value = b + (width * scaleX) / 2;
    }
    e.target
      ?.set({
        left: value
      })
      .setCoords();
    lineH!
      .set({
        x1: b,
        y1: artBoard?.top,
        x2: b,
        y2: artHeight.value + (artBoard?.top as number)
      })
      .setCoords();
    fabricCanvas?.renderAll();
  }
};

const checkVSnap = (
  a: number,
  b: number,
  snapZone: number,
  e: fabric.IEvent<MouseEvent>,
  type: number
) => {
  if (a > b - snapZone && a < b + snapZone) {
    const height = e.target?.get("height") as number;
    const scaleY = e.target?.get("scaleY") as number;
    lineV!.opacity = 1;
    lineV!.bringToFront();
    let value = b;
    if (type == 1) {
      value = b;
    } else if (type == 2) {
      value = b - (height * scaleY) / 2;
    } else if (type == 3) {
      value = b + (height * scaleY) / 2;
    }
    e.target
      ?.set({
        top: value
      })
      .setCoords();
    lineV!
      .set({
        y1: b,
        x1: artBoard?.left,
        y2: b,
        x2: artWidth.value + (artBoard?.left as number)
      })
      .setCoords();
    fabricCanvas?.renderAll();
  }
};

const alignActiveObject = (option: number) => {
  const activeObject = fabricCanvas?.getActiveObject();
  if (activeObject) {
    const artBoardTop = artBoard?.get("top") as number;
    const artBoardLeft = artBoard?.get("left") as number;
    const artBoardHeight = artBoard?.get("height") as number;
    const artBoardWidth = artBoard?.get("width") as number;

    const objectHeight = activeObject.get("height") as number;
    const objectWidth = activeObject.get("width") as number;
    const objectScaleY = activeObject.get("scaleY") as number;
    const objectScaleX = activeObject.get("scaleX") as number;

    switch (option) {
      case ALIGN_OPTIONS.TOP:
        activeObject.set(
          "top",
          artBoardTop + (objectHeight * objectScaleY) / 2
        );
        break;
      case ALIGN_OPTIONS.CENTER_V:
        activeObject.set("top", artBoardTop + artBoardHeight / 2);
        break;
      case ALIGN_OPTIONS.BOTTOM:
        activeObject.set(
          "top",
          artBoardTop + artBoardHeight - (objectHeight * objectScaleY) / 2
        );
        break;
      case ALIGN_OPTIONS.LEFT:
        activeObject.set(
          "left",
          artBoardLeft + (objectWidth * objectScaleX) / 2
        );
        break;
      case ALIGN_OPTIONS.CENTER_H:
        activeObject.set("left", artBoardLeft + artBoardWidth / 2);
        break;
      case ALIGN_OPTIONS.RIGHT:
        activeObject.set(
          "left",
          artBoardLeft + artBoardWidth - (objectWidth * objectScaleX) / 2
        );
        break;
    }
    fabricCanvas?.renderAll();
  }
};

const centerLines = (e: fabric.IEvent<MouseEvent>) => {
  lineH!.opacity = 0;
  lineV!.opacity = 0;
  fabricCanvas!.renderAll();

  const snapZone = 5;
  const targetLeft = e.target?.left as number;
  const targetTop = e.target?.top as number;
  const targetWidth =
    (e.target?.get("width") as number) * (e.target?.get("scaleX") as number);
  const targetHeight =
    (e.target?.get("height") as number) * (e.target?.get("scaleY") as number);

  fabricCanvas!.forEachObject((obj) => {
    if (obj != e.target && obj != lineH && obj != lineV) {
      const left = obj.get("left") as number;
      const top = obj.get("top") as number;
      const width = obj.get("width") as number;
      const height = obj.get("height") as number;
      const scaleX = obj.get("scaleX") as number;
      const scaleY = obj.get("scaleY") as number;

      //@ts-ignore
      if (obj.get("id") == "centerH" || obj.get("id") == "centerV") {
        checkHSnap(targetLeft, left, snapZone, e, 1);
        checkVSnap(targetTop, top, snapZone, e, 1);
      } else {
        const checkLeft = [
          [targetLeft, left, 1],
          [targetLeft, left + (width * scaleX) / 2, 1],
          [targetLeft, left - (width * scaleX) / 2, 1],
          [targetLeft + targetWidth / 2, left, 2],
          [targetLeft + targetWidth / 2, left + (width * scaleX) / 2, 2],
          [targetLeft + targetWidth / 2, left - (width * scaleX) / 2, 2],
          [targetLeft - targetWidth / 2, left, 3],
          [targetLeft - targetWidth / 2, left + (width * scaleX) / 2, 3],
          [targetLeft - targetWidth / 2, left - (width * scaleX) / 2, 3]
        ];

        const checkTop = [
          [targetTop, top, 1],
          [targetTop, top + (height * scaleY) / 2, 1],
          [targetTop, top - (height * scaleY) / 2, 1],
          [targetTop + targetHeight / 2, top, 2],
          [targetTop + targetHeight / 2, top + (height * scaleY) / 2, 2],
          [targetTop + targetHeight / 2, top - (height * scaleY) / 2, 2],
          [targetTop - targetHeight / 2, top, 3],
          [targetTop - targetHeight / 2, top + (height * scaleY) / 2, 3],
          [targetTop - targetHeight / 2, top - (height * scaleY) / 2, 3]
        ];

        for (let i = 0; i < checkLeft.length; i++) {
          const [aLeft, bLeft, type1] = checkLeft[i];
          const [aTop, bTop, type2] = checkTop[i];
          checkHSnap(aLeft, bLeft, snapZone, e, type1);
          checkVSnap(aTop, bTop, snapZone, e, type2);
        }
      }
    }
  });
};

watch([width, height], async (val) => {
  const [width, height] = val;
  await nextTick(() => {
    fabricCanvas?.setHeight(height);
    fabricCanvas?.setWidth(width);
    artBoard!.left = width / 2 - artWidth.value / 2;
    artBoard!.top = height / 2 - artHeight.value / 2;
    centerCircle!.left = width / 2 - 20;
    centerCircle!.top = height / 2 - 20;
    fabricCanvas?.renderAll();
    initLines();
  });
});

onKeyDown("Delete", () => {
  fabricCanvas?.getActiveObjects().forEach((obj) => fabricCanvas?.remove(obj));
  fabricCanvas?.discardActiveObject().renderAll();
});

const wheelScrollEvent = useEventListener(document, "wheel", (e) => {
  const scrollingUp = Math.sign(e.deltaY) < 0; // Down = 1, Up = -1
  let zoom = fabricCanvas!.getZoom() + (scrollingUp ? 0.02 : -0.02);
  if (zoom < 0.02) zoom = 0.02;
  fabricCanvas!.setZoom(1);
  fabricCanvas!.renderAll();
  const vpw = width.value / zoom;
  const vph = height.value / zoom;
  const x = artBoard?.left || 0 + artWidth.value / 2 - vpw / 2;
  const y = artBoard?.top || 0 + artHeight.value / 2 - vph / 2;
  fabricCanvas!.absolutePan({ x, y });
  fabricCanvas!.setZoom(zoom);
  fabricCanvas!.renderAll();
  zoomLevel.value = `${(fabricCanvas!.getZoom() * 100).toFixed(0)}%`;
});

onMounted(async () => {
  fabricCanvas = initializeFabric(
    canvas.value as HTMLCanvasElement,
    width.value,
    height.value,
    artboardColor.value
  );

  artBoard = new fabric.Rect({
    left: width.value / 2 - artWidth.value / 2,
    top: height.value / 2 - artHeight.value / 2,
    width: artWidth.value,
    height: artHeight.value,
    absolutePositioned: true,
    rx: 0,
    ry: 0,
    hasControls: true,
    transparentCorners: false,
    borderColor: "#0E98FC",
    cornerColor: "#0E98FC"
  });

  centerCircle = new fabric.Circle({
    opacity: 0,
    left: width.value / 2 - 10,
    top: height.value / 2 - 10,
    width: 20,
    height: 20
  });

  fabricCanvas.add(centerCircle);

  fabricCanvas.renderAll();
  fabricCanvas.clipPath = artBoard;
  fabricCanvas.renderAll();

  fabricCanvas.on("object:moving", (e) => {
    e.target!.hasControls = false;
    centerLines(e);
  });

  fabricCanvas.on("object:scaling", (e) => {
    e.target!.hasControls = false;
    centerLines(e);
  });

  fabricCanvas.on("object:modified", (e) => {
    e.target!.hasControls = true;
    fabricCanvas!.renderAll();
  });

  fabricCanvas.on("object:rotating", function (e) {
    if (e.e.shiftKey) fabricCanvas!.getActiveObject()!.snapAngle = 15;
    else fabricCanvas!.getActiveObject()!.snapAngle = 0;
    e.target!.hasControls = false;
  });

  fabricCanvas.on("mouse:up", () => {
    lineH!.opacity = 0;
    lineV!.opacity = 0;
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
