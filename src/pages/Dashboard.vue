<template>
  <div
    class="w-full flex text-white"
    style="height: calc(100% - var(--timeline-height-full))"
  >
    <sidebar class="w-3/12" />
    <div
      class="main w-7/12 h-full flex flex-col justify-center items-center relative"
    >
      <div class="top-left flex flex-col">
        <div>
          <span class="text-slate-500 font-bold">Used</span>
          {{ bytesToMB(memory?.usedJSHeapSize) }}
        </div>
        <div>
          <span class="text-slate-500 font-bold">Allocated</span>
          {{ bytesToMB(memory?.totalJSHeapSize) }}
        </div>
        <div>
          <span class="text-slate-500 font-bold">Limit</span>
          {{ bytesToMB(memory?.jsHeapSizeLimit) }}
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
        <div class="mt-3 flex justify-center bg-slate-800 py-1 rounded-md">
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
    <div class="w-4/12 border-r border-slate-700 h-full p-5">
      <div>Layers</div>
      <div class="text-slate-500 mt-3">
        {{ state.layers.length ? "Layers" : "No layers added." }}
      </div>
    </div>
    <div class="w-8/12 h-full p-5">Draggable timeline</div>
  </div>
  <div
    class="flex justify-between items-center bg-slate-800 text-white px-5"
    style="height: var(--timeline-controls-height)"
  >
    <div class="flex justify-center items-center w-3/12">
      <slider class="mr-3" v-model="state.timelineScale" />
      <m-select
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
      <btn @click="save" background-color="indigo-400"> Save </btn>
    </div>
  </div>
</template>

<script setup lang="ts">
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
import Layout from "../components/dashboard/layout/layout.vue";
import Sidebar from "../components/dashboard/sidebar/sidebar.vue";
import { AssetEvent, Layer, SelectItem } from "../models/common";
import { useDashboardStore } from "../store/dashboard";
import { useToastStore } from "../store/toast";
import { COLORS } from "../utils/colors";
import {
  ALIGN_OPTIONS,
  ASSET_TYPE,
  SNAP_CHECK_DIRECTION,
  TIME_OPTIONS
} from "../utils/constants";
import {
  checkHSnap,
  checkVSnap,
  getObjectById,
  initializeFabric
} from "../utils/fabric";
import { bytesToMB } from "../utils/helpers";

interface State {
  timelineScale: number;
  zoomLevel: string;
  layers: Layer[];
}

const dashboardStore = useDashboardStore();
const { createToast } = useToastStore();
const bus = useEventBus<AssetEvent>("asset");

const { artboardColor, artWidth, artHeight } = storeToRefs(dashboardStore);

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

const save = () => {
  createToast("💾 Saved", "#2171b3");
};

const newVideo = (
  file: HTMLVideoElement,
  src: string,
  x: number,
  y: number,
  duration: number,
  center: boolean
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
    source: src,
    duration: duration * 1000,
    assetType: "video",
    id: "Video" + state.layers.length,
    objectCaching: false,
    inGroup: false
  });

  //@ts-ignore
  newVideo.saveElem = newVideo.getElement();
  fabricCanvas?.add(newVideo);

  if ((newVideo.get("width") as number) > artWidth.value) {
    newVideo.scaleToWidth(artWidth.value);
  }

  newVideo.scaleToWidth(150);

  fabricCanvas?.renderAll();
  fabricCanvas?.setActiveObject(newVideo);
  fabricCanvas?.bringToFront(newVideo);

  if (center) {
    newVideo.set(
      "left",
      (artBoard?.get("left") as number) + artWidth.value / 2
    );
    newVideo.set("top", artBoardTop.value + artHeight.value / 2);
    fabricCanvas?.renderAll();
  }
};

const loadVideo = (src: string, x: number, y: number, center: boolean) => {
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
        newVideo(vidObj, src, x, y, vidObj.duration, center);
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
  x: number,
  y: number,
  font: string
) => {
  const newText = new fabric.Textbox(text, {
    left: x,
    top: y,
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
    id: "Text" + state.layers.length
  });
  newText.setControlsVisibility({
    mt: false,
    mb: false
  });
  fabricCanvas?.add(newText);
  fabricCanvas?.setActiveObject(newText);
  fabricCanvas?.bringToFront(newText);
  newText.enterEditing();
  newText.selectAll();
  fabricCanvas?.renderAll();
  newText.set("left", artBoardLeft.value + artWidth.value / 2);
  newText.set("top", artBoardTop.value + artHeight.value / 2);
  //@ts-ignore
  fabricCanvas!.getActiveObject()!.set("fontFamily", font);
  fabricCanvas?.renderAll();
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
      artBoard!.top as number,
      fabricCanvas!.getWidth() / 2,
      artHeight.value + (artBoard!.top as number)
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
      artBoard!.left as number,
      fabricCanvas!.getHeight() / 2,
      artWidth.value + (artBoard!.left as number),
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

  fabricCanvas!.add(lineH);
  fabricCanvas!.add(lineV);
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
        activeObject.set("top", artBoardTop.value + artHeight.value / 2);
        break;
      case ALIGN_OPTIONS.BOTTOM:
        activeObject.set(
          "top",
          artBoardTop.value +
            artHeight.value -
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
        activeObject.set("left", artBoardLeft.value + artWidth.value / 2);
        break;
      case ALIGN_OPTIONS.RIGHT:
        activeObject.set(
          "left",
          artBoardLeft.value + artWidth.value - (objectWidth * objectScaleX) / 2
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
        checkHSnap(
          lineH,
          artBoardTop.value,
          artHeight.value,
          targetLeft,
          left,
          snapZone,
          e,
          1
        );
        checkVSnap(
          lineV,
          artBoardLeft.value,
          artWidth.value,
          targetTop,
          top,
          snapZone,
          e,
          1
        );
        fabricCanvas?.renderAll();
      } else {
        const checkLeft = [
          [targetLeft, left, SNAP_CHECK_DIRECTION.MIDDLE],
          [
            targetLeft,
            left + (width * scaleX) / 2,
            SNAP_CHECK_DIRECTION.MIDDLE
          ],
          [
            targetLeft,
            left - (width * scaleX) / 2,
            SNAP_CHECK_DIRECTION.MIDDLE
          ],
          [targetLeft + targetWidth / 2, left, SNAP_CHECK_DIRECTION.BOTTOM],
          [
            targetLeft + targetWidth / 2,
            left + (width * scaleX) / 2,
            SNAP_CHECK_DIRECTION.BOTTOM
          ],
          [
            targetLeft + targetWidth / 2,
            left - (width * scaleX) / 2,
            SNAP_CHECK_DIRECTION.BOTTOM
          ],
          [targetLeft - targetWidth / 2, left, SNAP_CHECK_DIRECTION.TOP],
          [
            targetLeft - targetWidth / 2,
            left + (width * scaleX) / 2,
            SNAP_CHECK_DIRECTION.TOP
          ],
          [
            targetLeft - targetWidth / 2,
            left - (width * scaleX) / 2,
            SNAP_CHECK_DIRECTION.TOP
          ]
        ];

        const checkTop = [
          [targetTop, top, SNAP_CHECK_DIRECTION.MIDDLE],
          [targetTop, top + (height * scaleY) / 2, SNAP_CHECK_DIRECTION.MIDDLE],
          [targetTop, top - (height * scaleY) / 2, SNAP_CHECK_DIRECTION.MIDDLE],
          [targetTop + targetHeight / 2, top, SNAP_CHECK_DIRECTION.BOTTOM],
          [
            targetTop + targetHeight / 2,
            top + (height * scaleY) / 2,
            SNAP_CHECK_DIRECTION.BOTTOM
          ],
          [
            targetTop + targetHeight / 2,
            top - (height * scaleY) / 2,
            SNAP_CHECK_DIRECTION.BOTTOM
          ],
          [targetTop - targetHeight / 2, top, SNAP_CHECK_DIRECTION.TOP],
          [
            targetTop - targetHeight / 2,
            top + (height * scaleY) / 2,
            SNAP_CHECK_DIRECTION.TOP
          ],
          [
            targetTop - targetHeight / 2,
            top - (height * scaleY) / 2,
            SNAP_CHECK_DIRECTION.TOP
          ]
        ];

        for (let i = 0; i < checkLeft.length; i++) {
          const [aLeft, bLeft, type1] = checkLeft[i];
          const [aTop, bTop, type2] = checkTop[i];
          checkHSnap(
            lineH,
            artBoardTop.value,
            artHeight.value,
            aLeft,
            bLeft,
            snapZone,
            e,
            type1
          );
          checkVSnap(
            lineV,
            artBoardLeft.value,
            artWidth.value,
            aTop,
            bTop,
            snapZone,
            e,
            type2
          );
        }
      }
    }
  });
};

onKeyDown("Delete", () => {
  fabricCanvas?.getActiveObjects().forEach((obj) => fabricCanvas?.remove(obj));
  fabricCanvas?.discardActiveObject().renderAll();
});

const listener = (event: AssetEvent) => {
  switch (event.type) {
    case ASSET_TYPE.EMOJI:
      fabric.loadSVGFromURL(
        `/emojis/${event.value}.svg`,
        (objects, options) => {
          const svgData = fabric.util.groupSVGElements(objects, options);
          svgData.top = mainHeight.value / 2 - (svgData.height as number) / 2;
          svgData.left = mainWidth.value / 2 - (svgData.width as number) / 2;
          fabricCanvas?.add(svgData);
          fabricCanvas?.setActiveObject(svgData);
          state.layers.push({
            id: randInt(1, 9999).toString(),
            object: svgData,
            type: "image"
          });
        }
      );
      break;
    case ASSET_TYPE.TEXT:
      switch (event.value) {
        case "heading":
          newTextbox(
            50,
            700,
            "Heading",
            mainHeight.value / 2 - 20,
            mainWidth.value / 2 - 20,
            "Roboto"
          );
          break;
        case "subheading":
          newTextbox(
            22,
            500,
            "Subheading",
            mainHeight.value / 2 - 20,
            mainWidth.value / 2 - 20,
            "Roboto"
          );
          break;
        case "body":
          newTextbox(
            18,
            400,
            "Body",
            mainHeight.value / 2 - 20,
            mainWidth.value / 2 - 20,
            "Roboto"
          );
          break;
        default:
          newTextbox(
            18,
            400,
            "Text",
            mainHeight.value / 2 - 20,
            mainWidth.value / 2 - 20,
            event.value
          );
          break;
      }
      break;
  }
};

const unsubscribe = bus.on(listener);

const wheelScrollEvent = useEventListener(main, "wheel", (e: WheelEvent) => {
  const scrollingUp = Math.sign(e.deltaY) < 0; // Down = 1, Up = -1
  let zoom = fabricCanvas!.getZoom() + (scrollingUp ? 0.02 : -0.02);
  if (zoom < 0.02) zoom = 0.02;
  fabricCanvas?.setZoom(1);
  fabricCanvas?.renderAll();
  const x =
    artBoard?.left || 0 + artWidth.value / 2 - mainWidth.value / zoom / 2;
  const y =
    artBoard?.top || 0 + artHeight.value / 2 - mainHeight.value / zoom / 2;
  fabricCanvas?.absolutePan({ x, y });
  fabricCanvas?.setZoom(zoom);
  fabricCanvas?.renderAll();
  state.zoomLevel = `${(fabricCanvas!.getZoom() * 100).toFixed(0)}%`;
});

watch([mainWidth, mainHeight], async ([width, height]) => {
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

watch(artboardColor, (val) => {
  fabricCanvas?.setBackgroundColor(val, () => {});
  fabricCanvas?.renderAll();
});

watch([artHeight, artWidth], ([heightA, widthA]) => {
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
    left: mainWidth.value / 2 - artWidth.value / 2,
    top: mainHeight.value / 2 - artHeight.value / 2,
    width: artWidth.value,
    height: artHeight.value,
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

  fabricCanvas.on("mouse:up", () => {
    lineH!.opacity = 0;
    lineV!.opacity = 0;
  });

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
</style>
