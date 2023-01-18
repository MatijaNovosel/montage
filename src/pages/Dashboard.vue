<template>
  <div
    class="w-full flex text-white"
    style="height: calc(100% - var(--timeline-height-full))"
  >
    <sidebar class="w-3/12" />
    <div
      class="main w-7/12 h-full flex flex-col justify-center items-center relative"
    >
      <div class="top-left flex flex-col select-none">
        <div>
          <span class="text-slate-500 font-bold">🗑️ Used </span>
          {{ bytesToMB(memory?.usedJSHeapSize) }}
        </div>
        <div class="py-1">
          <span class="text-slate-500 font-bold">📦 Allocated </span>
          {{ bytesToMB(memory?.totalJSHeapSize) }}
        </div>
        <div>
          <span class="text-slate-500 font-bold">💾 Limit </span>
          {{ bytesToMB(memory?.jsHeapSizeLimit) }}
        </div>
      </div>
      <div class="top-right flex flex-col">
        <div class="flex">
          <btn class="mr-2" @click="undo" background-color="#475569">
            <img class="mr-2" src="/undo.svg" /> Undo
          </btn>
          <btn>
            <img class="scale-x-n1 mr-2" src="/undo.svg" />
            Redo
          </btn>
        </div>
        <div
          class="mt-3 flex justify-center bg-slate-800 py-1 rounded-md select-none"
        >
          {{ state.zoomLevel }}
        </div>
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
    <div class="w-4/12 border-r border-slate-700 h-full">
      <div
        class="layers-ctr-title border-b border-slate-700 flex items-center pl-4 text-slate-500 select-none"
      >
        LAYERS
      </div>
      <div class="flex flex-col overflow-auto layers-ctr pr-2">
        <template v-if="state.layers.length">
          <div
            class="pl-4 py-3 cursor-pointer"
            v-for="(layer, i) of state.layers"
            :class="{
              'bg-slate-800 hover:bg-slate-700': i % 2,
              'bg-slate-900 hover:bg-slate-800': !(i % 2),
              'bg-indigo-500 hover:bg-indigo-400': activeObjectId === layer.id,
              'rounded-t-md': i === 0
            }"
            :key="layer.id"
            @click="setActiveObject(layer.id)"
          >
            {{ layer.id }} - {{ layer.type }}
          </div>
        </template>
        <div class="text-slate-600 p-5" v-else>No layers added.</div>
      </div>
    </div>
    <div class="w-8/12 h-full p-5">
      <div class="text-slate-500 select-none">TIMELINE</div>
    </div>
  </div>
  <div
    class="flex justify-between items-center bg-slate-800 text-white px-5"
    style="height: var(--timeline-controls-height)"
  >
    <div class="flex justify-center items-center w-3/12">
      <slider class="mr-3 w-7/12" v-model="state.timelineScale" />
      <m-select
        class="w-5/12"
        background-color="slate-900"
        placement="top-start"
        placeholder="Speed"
        :options="TIME_OPTIONS"
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
      <btn @click="$export" background-color="#2171b3"> Export </btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import Layout from "@/components/dashboard/layout/layout.vue";
import Sidebar from "@/components/dashboard/sidebar/sidebar.vue";
import { AssetEvent, Layer, SelectItem } from "@/models/common";
import { useDashboardStore } from "@/store/dashboard";
import { useToastStore } from "@/store/toast";
import { COLORS } from "@/utils/colors";
import { ALIGN_OPTIONS, ASSET_TYPE, TIME_OPTIONS } from "@/utils/constants";
import { centerLines, getObjectById, initializeFabric } from "@/utils/fabric";
import { bytesToMB } from "@/utils/helpers";
import {
  onKeyDown,
  useElementSize,
  useEventBus,
  useEventListener,
  useMemory
} from "@vueuse/core";
import { fabric } from "fabric";
import { randInt } from "matija-utils";
import { storeToRefs } from "pinia";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import WebFont from "webfontloader";

interface State {
  timelineScale: number;
  zoomLevel: string;
  layers: Layer[];
}

const dashboardStore = useDashboardStore();
const { createToast } = useToastStore();
const bus = useEventBus<AssetEvent>("asset");

const { artboardColor, artBoardWidth, artBoardHeight, activeObjectId } =
  storeToRefs(dashboardStore);

const state: State = reactive({
  timelineScale: 0,
  zoomLevel: "100%",
  layers: []
});

const playbackSpeed = ref<SelectItem<number> | null>(TIME_OPTIONS[1]);

const canvas = ref<HTMLCanvasElement | null>(null);
const main = ref<HTMLElement | null>(null);

let fabricCanvas: fabric.Canvas | null = null;
let artBoard: fabric.Rect | null = null;
let lineH: fabric.Line | null = null;
let lineV: fabric.Line | null = null;
let centerCircle: fabric.Circle | null = null;

const artBoardLeft = computed(() => artBoard?.get("left") as number);
const artBoardTop = computed(() => artBoard?.get("top") as number);

const { width: mainWidth, height: mainHeight } = useElementSize(main);
const { memory } = useMemory();

const undo = () => {
  createToast("🚨 Undo", "#f80000");
};

const $export = () => {
  createToast("💾 Exported!", "#2171b3");
};

const newVideo = (
  file: HTMLVideoElement,
  source: string,
  x: number,
  y: number,
  duration: number
) => {
  const newVideo = new fabric.Image(file, {
    left: x,
    top: y,
    width: file.width,
    height: file.height,
    originX: "center",
    originY: "center",
    backgroundColor: "rgba(255,255,255,0)",
    stroke: "#000",
    strokeUniform: true,
    paintFirst: "stroke",
    strokeWidth: 0,
    //@ts-ignore
    source,
    duration: duration * 1000,
    assetType: "video",
    id: `video_${state.layers.length}`,
    objectCaching: false,
    inGroup: false
  });

  //@ts-ignore
  newVideo.saveElem = newVideo.getElement();
  fabricCanvas?.add(newVideo);
  if ((newVideo.get("width") as number) > artBoardWidth.value) {
    newVideo.scaleToWidth(artBoardWidth.value);
  }
  newVideo.scaleToWidth(150);
  fabricCanvas?.renderAll();
  fabricCanvas?.setActiveObject(newVideo);
  fabricCanvas?.bringToFront(newVideo);
  newVideo.set("left", artBoardLeft.value + artBoardWidth.value / 2);
  newVideo.set("top", artBoardTop.value + artBoardHeight.value / 2);
  fabricCanvas?.renderAll();
};

const loadVideo = (src: string, x: number, y: number) => {
  var vidObj = document.createElement("video");
  var vidSrc = document.createElement("source");
  vidSrc.src = src;
  vidObj.crossOrigin = "anonymous";
  vidObj.appendChild(vidSrc);
  vidObj.addEventListener("loadeddata", function () {
    vidObj.width = this.videoWidth;
    vidObj.height = this.videoHeight;
    vidObj.currentTime = 0;
    vidObj.muted = false;
    const waitLoad = () => {
      if (vidObj.readyState >= 3) {
        newVideo(vidObj, src, x, y, vidObj.duration);
      } else {
        setTimeout(waitLoad, 100);
      }
    };
    setTimeout(waitLoad, 100);
  });
  vidObj.currentTime = 0;
};

const calculateTextWidth = (text: string, font: string) => {
  const ctx = fabricCanvas?.getContext();
  ctx!.font = font;
  return ctx!.measureText(text).width + 10;
};

const newTextbox = (
  fontSize: number,
  fontWeight: string | number | undefined,
  text: string,
  font: string
) => {
  const id = randInt(1, 9999).toString();
  const newText = new fabric.Textbox(text, {
    left: mainHeight.value / 2 - 20,
    top: mainWidth.value / 2 - 20,
    originX: "center",
    originY: "center",
    fontFamily: "Roboto",
    fill: "#fff",
    fontSize,
    fontWeight,
    textAlign: "center",
    cursorWidth: 1,
    stroke: "#000",
    strokeWidth: 0,
    cursorDuration: 1,
    paintFirst: "stroke",
    objectCaching: false,
    absolutePositioned: true,
    strokeUniform: true,
    //@ts-ignore
    inGroup: false,
    cursorDelay: 250,
    width: calculateTextWidth(text, `${fontWeight} ${fontSize}px Roboto`),
    id
  });
  fabricCanvas?.add(newText);
  fabricCanvas?.setActiveObject(newText);
  fabricCanvas?.bringToFront(newText);
  newText.enterEditing();
  newText.selectAll();
  fabricCanvas?.renderAll();
  newText.set("left", artBoardLeft.value + artBoardWidth.value / 2);
  newText.set("top", artBoardTop.value + artBoardHeight.value / 2);
  //@ts-ignore
  fabricCanvas!.getActiveObject()!.set("fontFamily", font);
  fabricCanvas?.renderAll();
  state.layers.push({
    id,
    object: newText,
    type: "text"
  });
};

const initLines = () => {
  if (getObjectById(fabricCanvas, "centerH")) {
    fabricCanvas?.remove(getObjectById(fabricCanvas, "centerH"));
    fabricCanvas?.remove(getObjectById(fabricCanvas, "centerV"));
  }

  if (getObjectById(fabricCanvas, "lineH")) {
    fabricCanvas?.remove(getObjectById(fabricCanvas, "lineH"));
    fabricCanvas?.remove(getObjectById(fabricCanvas, "lineV"));
  }

  fabricCanvas?.add(
    new fabric.Line(
      [
        fabricCanvas?.getWidth() / 2,
        0,
        fabricCanvas?.getWidth() / 2,
        fabricCanvas?.getHeight()
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

  fabricCanvas?.add(
    new fabric.Line(
      [
        0,
        fabricCanvas?.getHeight() / 2,
        fabricCanvas?.getWidth(),
        fabricCanvas?.getHeight() / 2
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

  lineH = new fabric.Line(
    [
      fabricCanvas!.getWidth() / 2,
      artBoardTop.value,
      fabricCanvas!.getWidth() / 2,
      artBoardHeight.value + artBoardTop.value
    ],
    {
      stroke: COLORS.SELECTION,
      opacity: 0,
      selectable: false,
      evented: false,
      //@ts-ignore
      id: "lineH"
    }
  );

  lineV = new fabric.Line(
    [
      artBoardLeft.value,
      fabricCanvas!.getHeight() / 2,
      artBoardWidth.value + artBoardLeft.value,
      fabricCanvas!.getHeight() / 2
    ],
    {
      stroke: COLORS.SELECTION,
      opacity: 0,
      selectable: false,
      evented: false,
      //@ts-ignore
      id: "lineV"
    }
  );

  fabricCanvas?.add(lineH);
  fabricCanvas?.add(lineV);
};

const setActiveObject = (id: string) => {
  const obj = getObjectById(fabricCanvas, id);
  if (obj) {
    fabricCanvas?.setActiveObject(obj);
    fabricCanvas?.renderAll();
  }
};

const alignActiveObject = (option: number) => {
  const activeObject = fabricCanvas?.getActiveObject();
  if (activeObject) {
    const objectHeight = activeObject.get("height") as number;
    const objectWidth = activeObject.get("width") as number;
    const objectScaleY = activeObject.get("scaleY") as number;
    const objectScaleX = activeObject.get("scaleX") as number;

    switch (option) {
      case ALIGN_OPTIONS.TOP:
        activeObject.set(
          "top",
          artBoardTop.value + (objectHeight * objectScaleY) / 2
        );
        break;
      case ALIGN_OPTIONS.CENTER_V:
        activeObject.set("top", artBoardTop.value + artBoardHeight.value / 2);
        break;
      case ALIGN_OPTIONS.BOTTOM:
        activeObject.set(
          "top",
          artBoardTop.value +
            artBoardHeight.value -
            (objectHeight * objectScaleY) / 2
        );
        break;
      case ALIGN_OPTIONS.LEFT:
        activeObject.set(
          "left",
          artBoardLeft.value + (objectWidth * objectScaleX) / 2
        );
        break;
      case ALIGN_OPTIONS.CENTER_H:
        activeObject.set("left", artBoardLeft.value + artBoardWidth.value / 2);
        break;
      case ALIGN_OPTIONS.RIGHT:
        activeObject.set(
          "left",
          artBoardLeft.value +
            artBoardWidth.value -
            (objectWidth * objectScaleX) / 2
        );
        break;
    }
    fabricCanvas?.renderAll();
  }
};

onKeyDown("Delete", () => {
  fabricCanvas?.getActiveObjects().forEach((obj) => {
    //@ts-ignore
    const id: string = obj.id;
    state.layers = state.layers.filter((l) => l.id !== id);
    fabricCanvas?.remove(obj);
  });
  fabricCanvas?.discardActiveObject().renderAll();
});

const addAsset = (event: AssetEvent) => {
  switch (event.type) {
    case ASSET_TYPE.EMOJI:
      fabric.loadSVGFromURL(
        `/emojis/${event.value}.svg`,
        (objects, options) => {
          const svgData = fabric.util.groupSVGElements(objects, options);
          svgData.top = mainHeight.value / 2 - (svgData.height as number) / 2;
          svgData.left = mainWidth.value / 2 - (svgData.width as number) / 2;
          const id = randInt(1, 9999).toString();
          //@ts-ignore
          svgData.id = id;
          fabricCanvas?.add(svgData);
          fabricCanvas?.setActiveObject(svgData);
          state.layers.push({
            id,
            object: svgData,
            type: "image"
          });
        }
      );
      break;
    case ASSET_TYPE.TEXT:
      switch (event.value) {
        case "heading":
          newTextbox(50, 700, "Heading", "Roboto");
          break;
        case "subheading":
          newTextbox(22, 500, "Subheading", "Roboto");
          break;
        case "body":
          newTextbox(18, 400, "Body", "Roboto");
          break;
        default:
          newTextbox(18, 400, "Text", event.value);
          break;
      }
      break;
  }
};

const unsubscribe = bus.on(addAsset);

const wheelScrollEvent = useEventListener(main, "wheel", (e: WheelEvent) => {
  const scrollingUp = Math.sign(e.deltaY) < 0; // Down = 1, Up = -1
  let zoom = fabricCanvas!.getZoom() + (scrollingUp ? 0.02 : -0.02);
  if (zoom < 0.02) zoom = 0.02;
  fabricCanvas?.setZoom(1);
  fabricCanvas?.renderAll();
  fabricCanvas?.absolutePan({
    x:
      artBoardLeft.value + artBoardWidth.value / 2 - mainWidth.value / zoom / 2,
    y:
      artBoardTop.value + artBoardHeight.value / 2 - mainHeight.value / zoom / 2
  });
  fabricCanvas?.setZoom(zoom);
  fabricCanvas?.renderAll();
  state.zoomLevel = `${(fabricCanvas!.getZoom() * 100).toFixed(0)}%`;
});

const handleLines = (e: fabric.IEvent<MouseEvent>) => {
  e.target!.hasControls = false;
  centerLines(
    e,
    lineH,
    lineV,
    fabricCanvas,
    artBoardTop.value,
    artBoardLeft.value,
    artBoardWidth.value,
    artBoardHeight.value
  );
};

watch([mainWidth, mainHeight], async ([width, height]) => {
  await nextTick(() => {
    fabricCanvas?.setHeight(height);
    fabricCanvas?.setWidth(width);
    artBoard!.left = width / 2 - artBoardWidth.value / 2;
    artBoard!.top = height / 2 - artBoardHeight.value / 2;
    centerCircle!.left = width / 2 - 20;
    centerCircle!.top = height / 2 - 20;
    fabricCanvas?.renderAll();
    initLines();
  });
});

watch(artboardColor, (val) => {
  fabricCanvas?.setBackgroundColor(val, () => {});
  fabricCanvas?.renderAll();
});

watch([artBoardHeight, artBoardWidth], ([heightA, widthA]) => {
  artBoard!.width = widthA;
  artBoard!.height = heightA;
  artBoard!.left = mainWidth.value / 2 - widthA / 2;
  artBoard!.top = mainHeight.value / 2 - heightA / 2;
  fabricCanvas?.renderAll();
});

onMounted(() => {
  // TODO: Convert this to a static include
  WebFont.load({
    google: {
      families: ["Roboto"]
    }
  });

  fabricCanvas = initializeFabric(
    canvas.value as HTMLCanvasElement,
    mainWidth.value,
    mainHeight.value,
    artboardColor.value
  );

  artBoard = new fabric.Rect({
    left: mainWidth.value / 2 - artBoardWidth.value / 2,
    top: mainHeight.value / 2 - artBoardHeight.value / 2,
    width: artBoardWidth.value,
    height: artBoardHeight.value,
    absolutePositioned: true,
    rx: 0,
    ry: 0,
    hasControls: true,
    transparentCorners: false,
    borderColor: COLORS.SELECTION,
    cornerColor: COLORS.SELECTION
  });

  centerCircle = new fabric.Circle({
    left: mainWidth.value / 2 - 10,
    top: mainHeight.value / 2 - 10,
    width: 20,
    height: 20
  });

  fabricCanvas.add(centerCircle);
  fabricCanvas.clipPath = artBoard;

  fabricCanvas.on("object:moving", handleLines);
  fabricCanvas.on("object:scaling", handleLines);
  fabricCanvas.on("mouse:up", () => {
    lineH!.opacity = 0;
    lineV!.opacity = 0;
  });

  fabricCanvas.on("selection:updated", () => {
    dashboardStore.setActiveObject(fabricCanvas?.getActiveObject());
  });

  fabricCanvas.on("selection:created", () => {
    dashboardStore.setActiveObject(fabricCanvas?.getActiveObject());
  });

  fabricCanvas.on("selection:cleared", () => {
    dashboardStore.setActiveObject(null);
  });

  fabricCanvas.renderAll();

  createToast("✅ App successfully started!", "#4BB543");
});

onBeforeUnmount(() => {
  wheelScrollEvent();
  unsubscribe();
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

.layers-ctr-title {
  height: 60px;
}

.layers-ctr {
  height: 177px;
}
</style>
