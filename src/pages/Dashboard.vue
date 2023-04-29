<template>
  <div
    class="w-full flex text-white"
    style="height: calc(100% - var(--timeline-height-full))"
  >
    <sidebar class="w-3/12" />
    <div
      class="main w-7/12 h-full flex flex-col justify-center items-center relative"
    >
      <div
        class="top-left flex flex-col select-none bg-black bg-opacity-50 p-2 rounded-lg"
      >
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
          <v-btn class="mr-2" @click="undo">
            <template #prepend>
              <v-icon> mdi-undo </v-icon>
            </template>
            Undo
          </v-btn>
          <v-btn>
            <template #prepend>
              <v-icon> mdi-refresh </v-icon>
            </template>
            Redo
          </v-btn>
        </div>
        <div
          class="mt-3 flex justify-center bg-slate-800 py-1 rounded-md select-none"
        >
          🔎 {{ state.zoomLevel }}
        </div>
      </div>
      <div
        class="bottom bg-black bg-opacity-50 px-4 py-2 rounded-lg z-10 text-2xl"
      >
        {{ renderedTime }}
      </div>
      <main ref="main" class="h-full w-full">
        <canvas class="block" ref="canvas" />
      </main>
    </div>
    <layout
      @bring-forward="bringActiveObjectForward"
      @send-backward="sendActiveObjectBackward"
      @align="alignActiveObject"
      class="w-2/12"
    />
  </div>
  <div
    class="flex bg-slate-900 text-white border-y border-slate-700 layers-ctr-title"
  >
    <div
      class="w-4/12 border-r border-slate-700 flex items-center pl-4 text-slate-500 select-none tracking-widest"
    >
      LAYERS
    </div>
    <div class="w-8/12 flex items-center justify-between px-5 py-3 relative">
      <div
        class="flex flex-col pt-4 text-slate-400"
        :key="i"
        v-for="(n, i) in 10"
      >
        <span> {{ n }}s </span>
        <span class="time-tick pt-5" />
      </div>
    </div>
  </div>
  <div class="flex bg-slate-900 text-white border-slate-700 layers-ctr">
    <div class="w-4/12 border-r border-slate-700 h-full">
      <div class="flex flex-col overflow-auto layers-ctr">
        <template v-if="state.layers.length">
          <div
            class="pl-4 cursor-pointer layer-item flex items-center"
            v-for="(layer, i) of state.layers"
            :class="{
              'bg-indigo-500 hover:bg-indigo-400': activeObjectId === layer.id,
              'bg-slate-800 hover:bg-slate-700':
                i % 2 && activeObjectId !== layer.id,
              'bg-slate-900 hover:bg-slate-800':
                !(i % 2) && activeObjectId !== layer.id
            }"
            :key="layer.id"
            @click="setActiveObject(layer.id)"
          >
            <span class="mr-3">
              {{ LAYER_TYPE_ICON[layer.type] }}
            </span>
            <span class="bg-black px-2 py-1 rounded-md text-xs">
              {{ layer.id }}
            </span>
          </div>
        </template>
        <div class="p-5" v-else>No layers added.</div>
      </div>
    </div>
    <div
      class="w-8/12 h-full relative seek-area"
      @mousemove="followCursor"
      @mouseleave="hideSeekbar"
      @click="seek"
    >
      <div id="seek-hover" :style="seekHoverStyle" />
      <div id="seekbar" :style="seekbarStyle" />
      <div
        class="flex flex-col layers-ctr overflow-auto"
        v-if="state.layers.length"
      >
        <div
          v-for="layer of state.layers"
          :key="layer.id"
          class="layer-item pl-4 flex items-center text-xs font-bold"
          :style="{
            backgroundColor: layer.color
          }"
        />
      </div>
    </div>
  </div>
  <div
    class="flex justify-between items-center bg-slate-800 text-white px-5"
    style="height: var(--timeline-controls-height)"
  >
    <div class="flex justify-center items-center w-3/12">
      <span> ◻️ </span>
      <v-slider
        hide-details
        class="mx-3 w-7/12"
        density="compact"
        v-model="state.timelineScale"
      />
      <span> ⬜ </span>
      <v-select
        class="ml-3 w-5/12"
        placeholder="Speed"
        density="compact"
        hide-details
        variant="solo"
        :items="TIME_OPTIONS"
        v-model="playbackSpeed"
      />
    </div>
    <div class="flex justify-center items-center w-6/12">
      <v-btn icon="mdi-skip-forward" class="scale-x-n1" variant="text" />
      <v-btn
        :icon="state.paused ? 'mdi-play' : 'mdi-pause'"
        variant="text"
        @click="togglePlay"
      />
      <v-btn icon="mdi-skip-forward" variant="text" />
    </div>
    <div class="flex justify-end items-center w-3/12">
      <v-btn @click="$export" background-color="#2171b3"> 💾 Export </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import Layout from "@/components/dashboard/layout/layout.vue";
import Sidebar from "@/components/dashboard/sidebar/sidebar.vue";
import { AssetEvent, Layer, SelectItem } from "@/models/common";
import { useDashboardStore } from "@/store/dashboard";
import { useToastStore } from "@/store/toast";
import {
  ALIGN_OPTIONS,
  ASSET_TYPE,
  LAYER_TYPE_ICON,
  TIME_OPTIONS
} from "@/utils/constants";
import {
  bringForward,
  centerLines,
  getObjectById,
  initializeFabric,
  sendBackwards
} from "@/utils/fabric";
import { bytesToMB, getFileExtension, readFile } from "@/utils/helpers";
import {
  onKeyDown,
  useElementSize,
  useEventBus,
  useEventListener,
  useMemory
} from "@vueuse/core";
import { fabric } from "fabric";
import { randInt, randomColorHex } from "matija-utils";
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
// @ts-ignore-line
import colors from "vuetify/lib/util/colors";

interface State {
  timelineScale: number;
  zoomLevel: string;
  layers: Layer[];
  playbackSpeed: SelectItem<number>;
  paused: boolean;
  currentTime: number;
  duration: number;
  seekHoverOffset: number;
  seekbarOffset: number;
  seeking: boolean;
}

const dashboardStore = useDashboardStore();
const { createToast } = useToastStore();
const bus = useEventBus<AssetEvent>("asset");

const { artboardColor, artboardHeight, artboardWidth, activeObjectId } =
  storeToRefs(dashboardStore);

const state: State = reactive({
  timelineScale: 0,
  zoomLevel: "100%",
  layers: [],
  playbackSpeed: TIME_OPTIONS[1],
  paused: true,
  currentTime: 0,
  duration: 30_000,
  seeking: false,
  seekHoverOffset: 0,
  seekbarOffset: 0
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

// Render current time in the playback area
const renderedTime = computed(() => {
  const minutes = Math.floor(state.currentTime / 1000 / 60);
  const seconds = parseFloat(
    (state.currentTime / 1000 - minutes * 60).toFixed(2)
  );
  return (
    ("0" + minutes).slice(-2) +
    ":" +
    ("0" + Math.floor(seconds)).slice(-2) +
    ":" +
    ("0" + Math.floor((seconds % 1) * 100)).slice(-2)
  );
});

const { width: mainWidth, height: mainHeight } = useElementSize(main);
const { memory } = useMemory();

const undo = () => {
  createToast("🚨 Undo", colors.red.darken1);
};

const $export = () => {
  createToast("💾 Exported!", colors.blue.darken1);
};

// NOTE: Videos will not animate properly if this is not used
fabric.util.requestAnimFrame(function render() {
  fabricCanvas?.renderAll();
  fabric.util.requestAnimFrame(render);
});

const playVideos = async (time?: string) => {
  state.layers
    .filter((l) => l.type === ASSET_TYPE.VIDEO)
    .forEach((l) => {
      // @ts-ignore
      const element = l.object.getElement();
      if (element.paused === true) {
        element.play();
      } else {
        element.pause();
      }
      fabricCanvas?.renderAll();
    });
};

const animate = (time?: string) => {
  playVideos();
};

const togglePlay = () => {
  state.paused = !state.paused;
  animate();
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
    left: artBoardLeft.value + artboardWidth.value / 2,
    top: artBoardTop.value + artboardHeight.value / 2,
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
    id: `text_${id}`
  });
  fabricCanvas?.add(newText);
  fabricCanvas?.setActiveObject(newText);
  fabricCanvas?.bringToFront(newText);
  newText.enterEditing();
  newText.selectAll();
  fabricCanvas?.renderAll();
  //@ts-ignore
  fabricCanvas!.getActiveObject()!.set("fontFamily", font);
  fabricCanvas?.renderAll();
  state.layers.push({
    id: `text_${id}`,
    object: newText,
    type: ASSET_TYPE.TEXT,
    color: randomColorHex()
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
      artboardHeight.value + artBoardTop.value
    ],
    {
      stroke: colors.blue.darken1,
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
      artboardWidth.value + artBoardLeft.value,
      fabricCanvas!.getHeight() / 2
    ],
    {
      stroke: colors.blue.darken1,
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
  if (obj && activeObjectId.value !== id) {
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
    const isTextBox = activeObject.type === "textbox";

    switch (option) {
      case ALIGN_OPTIONS.TOP:
        activeObject.set(
          "top",
          artBoardTop.value + (objectHeight * objectScaleY) / 2
        );
        break;
      case ALIGN_OPTIONS.CENTER_V:
        activeObject.set(
          "top",
          artBoardTop.value +
            artboardHeight.value / 2 -
            (isTextBox ? 0 : (objectHeight * objectScaleY) / 2)
        );
        break;
      case ALIGN_OPTIONS.BOTTOM:
        activeObject.set(
          "top",
          artBoardTop.value +
            artboardHeight.value -
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
        activeObject.set(
          "left",
          artBoardLeft.value +
            artboardWidth.value / 2 -
            (isTextBox ? 0 : (objectWidth * objectScaleX) / 2)
        );
        break;
      case ALIGN_OPTIONS.RIGHT:
        activeObject.set(
          "left",
          artBoardLeft.value +
            artboardWidth.value -
            (objectWidth * objectScaleX) / 2
        );
        break;
    }
    fabricCanvas?.renderAll();
  }
};

const newSvg = (path: string) => {
  fabric.loadSVGFromURL(path, (objects, options) => {
    const svgData = fabric.util.groupSVGElements(objects, options);
    svgData.top = mainHeight.value / 2 - (svgData.height as number) / 2;
    svgData.left = mainWidth.value / 2 - (svgData.width as number) / 2;
    const id = randInt(1, 9999).toString();
    //@ts-ignore
    svgData.id = `image_${id}`;
    fabricCanvas?.add(svgData);
    fabricCanvas?.setActiveObject(svgData);
    state.layers.push({
      id: `image_${id}`,
      object: svgData,
      type: ASSET_TYPE.IMAGE,
      color: randomColorHex()
    });
  });
};

onKeyDown("Delete", () => {
  fabricCanvas?.getActiveObjects().forEach((obj) => {
    //@ts-ignore
    state.layers = state.layers.filter((l) => l.id !== obj.id);
    fabricCanvas?.remove(obj);
  });
  fabricCanvas?.discardActiveObject().renderAll();
});

const newImage = async (source: File | string) => {
  const id = randInt(1, 9999).toString();
  if (typeof source !== "string") source = await readFile(source);
  fabric.Image.fromURL(source, (image) => {
    if (
      (image.get("width") as number) > artboardWidth.value ||
      (image.get("height") as number) > artboardHeight.value
    ) {
      image.scaleToWidth(artboardWidth.value);
      image.scaleToHeight(artboardHeight.value);
      image.set(
        "top",
        artBoardTop.value +
          artboardHeight.value / 2 -
          image.getScaledHeight() / 2
      );
      image.set(
        "left",
        artBoardLeft.value +
          artboardWidth.value / 2 -
          image.getScaledWidth() / 2
      );
    } else {
      image.set("top", artboardHeight.value / 2 - (image.height as number) / 2);
      image.set("left", artboardWidth.value / 2 - (image.width as number) / 2);
    }
    //@ts-ignore
    image.set("id", `image_${id}`);
    fabricCanvas?.add(image);
    fabricCanvas?.bringToFront(image);
    fabricCanvas?.setActiveObject(image);
    fabricCanvas?.renderAll();
    state.layers.push({
      id: `image_${id}`,
      object: image,
      type: ASSET_TYPE.IMAGE,
      color: randomColorHex()
    });
  });
};

const newVideo = (file: HTMLVideoElement, source: string, duration: number) => {
  const id = randInt(1, 9999).toString();
  const newVideo = new fabric.Image(file, {
    left: artBoardLeft.value + artboardWidth.value / 2,
    top: artBoardTop.value + artboardHeight.value / 2,
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
  if ((newVideo.get("width") as number) > artboardWidth.value) {
    newVideo.scaleToWidth(artboardWidth.value);
  }
  newVideo.scaleToWidth(150);
  fabricCanvas?.renderAll();
  fabricCanvas?.setActiveObject(newVideo);
  fabricCanvas?.bringToFront(newVideo);
  fabricCanvas?.renderAll();
  //@ts-ignore
  newVideo.set("id", `video_${id}`);
  state.layers.push({
    id: `video_${id}`,
    object: newVideo,
    type: ASSET_TYPE.VIDEO,
    color: randomColorHex()
  });
};

const loadVideo = (src: string) => {
  const vidObj = document.createElement("video");
  const vidSrc = document.createElement("source");
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
        newVideo(vidObj, src, vidObj.duration);
      } else {
        setTimeout(waitLoad, 100);
      }
    };
    setTimeout(waitLoad, 100);
  });
  vidObj.currentTime = 0;
};

const addAsset = async (event: AssetEvent) => {
  switch (event.type) {
    case ASSET_TYPE.EMOJI:
      newSvg(`/emojis/${event.value}.svg`);
      break;
    case ASSET_TYPE.SHAPE:
      newSvg(`/shapes/${event.value}.svg`);
      break;
    case ASSET_TYPE.IMAGE:
      newImage(`/images/${event.value}.jpg`);
      break;
    case ASSET_TYPE.UPLOAD:
      if (event.file) {
        switch (getFileExtension(event.file.name)) {
          case "png":
          case "jpg":
            newImage(event.file);
            break;
          case "mp4":
            const src = await readFile(event.file);
            loadVideo(src);
            break;
        }
      }
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

const hideSeekbar = () => {
  state.seeking = false;
};

const seekHoverStyle = computed(() => ({
  opacity: state.seeking ? 0.3 : 0,
  left: `${state.seekHoverOffset}px`
}));

const seekbarStyle = computed(() => ({
  left: `${state.seekbarOffset}px`
}));

const seek = (e: MouseEvent) => {
  // @ts-ignore
  const offset: number = e.layerX;
  console.log(offset);
  if (offset > 1) {
    state.seekbarOffset = offset;
    state.currentTime = offset;
  }
};

const followCursor = (e: MouseEvent) => {
  state.seeking = true;
  // @ts-ignore
  const offset: number = e.layerX;
  if (offset > 1) {
    state.seekHoverOffset = offset;
  }
};

const unsubscribe = bus.on(addAsset);

const wheelScrollEvent = useEventListener(main, "wheel", (e: WheelEvent) => {
  const scrollingUp = Math.sign(e.deltaY) < 0; // Down = 1, Up = -1
  let zoom = fabricCanvas!.getZoom() + (scrollingUp ? 0.1 : -0.1);
  if (zoom < 0.1) zoom = 0.1;
  fabricCanvas?.setZoom(1);
  fabricCanvas?.renderAll();
  fabricCanvas?.absolutePan({
    x:
      artBoardLeft.value + artboardWidth.value / 2 - mainWidth.value / zoom / 2,
    y:
      artBoardTop.value + artboardHeight.value / 2 - mainHeight.value / zoom / 2
  });
  fabricCanvas?.setZoom(zoom);
  fabricCanvas?.renderAll();
  state.zoomLevel = `${(fabricCanvas!.getZoom() * 100).toFixed(0)}%`;
});

const bringActiveObjectForward = () => {
  bringForward(fabricCanvas?.getActiveObject());
};

const sendActiveObjectBackward = () => {
  sendBackwards(fabricCanvas?.getActiveObject());
};

watch([mainWidth, mainHeight], async ([width, height]) => {
  await nextTick(() => {
    fabricCanvas?.setHeight(height);
    fabricCanvas?.setWidth(width);
    artBoard!.left = width / 2 - artboardWidth.value / 2;
    artBoard!.top = height / 2 - artboardHeight.value / 2;
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

watch([artboardHeight, artboardWidth], ([heightA, widthA]) => {
  artBoard!.width = widthA;
  artBoard!.height = heightA;
  artBoard!.left = mainWidth.value / 2 - widthA / 2;
  artBoard!.top = mainHeight.value / 2 - heightA / 2;
  fabricCanvas?.renderAll();
});

const updateActiveObjectDimensions = () => {
  const activeObject = fabricCanvas?.getActiveObject();
  if (activeObject) {
    const width = activeObject.get("width") as number;
    const height = activeObject.get("height") as number;
    const scaleX = activeObject.get("scaleX") as number;
    const scaleY = activeObject.get("scaleY") as number;
    dashboardStore.setActiveObject(activeObject);
    dashboardStore.setActiveObjectHeight(width * scaleX);
    dashboardStore.setActiveObjectWidth(height * scaleY);
  }
};

onMounted(() => {
  fabricCanvas = initializeFabric(
    canvas.value,
    mainWidth.value,
    mainHeight.value,
    artboardColor.value
  );

  artBoard = new fabric.Rect({
    left: mainWidth.value / 2 - artboardWidth.value / 2,
    top: mainHeight.value / 2 - artboardHeight.value / 2,
    width: artboardWidth.value,
    height: artboardHeight.value,
    absolutePositioned: true,
    rx: 0,
    ry: 0,
    hasControls: true,
    transparentCorners: false,
    borderColor: colors.blue.darken1,
    cornerColor: colors.blue.darken1
  });

  centerCircle = new fabric.Circle({
    left: mainWidth.value / 2 - 10,
    top: mainHeight.value / 2 - 10,
    width: 20,
    height: 20,
    selectable: false,
    hoverCursor: "auto"
  });

  fabricCanvas.add(centerCircle);
  fabricCanvas.clipPath = artBoard;

  fabricCanvas.on("object:moving", (e) => {
    e.target!.hasControls = false;
    if (e.e.shiftKey)
      centerLines(
        e,
        lineH,
        lineV,
        fabricCanvas,
        artBoardTop.value,
        artBoardLeft.value,
        artboardWidth.value,
        artboardHeight.value
      );
  });

  fabricCanvas.on("mouse:up", () => {
    lineH!.opacity = 0;
    lineV!.opacity = 0;
  });

  fabricCanvas.on("selection:updated", updateActiveObjectDimensions);
  fabricCanvas.on("selection:created", updateActiveObjectDimensions);

  fabricCanvas.on("selection:cleared", () => {
    dashboardStore.setActiveObject(null);
  });

  fabricCanvas.on("object:modified", (e) => {
    e.target!.hasControls = true;
    updateActiveObjectDimensions();
    fabricCanvas?.renderAll();
  });

  fabricCanvas.on("object:rotating", (e) => {
    if (e.e.shiftKey) fabricCanvas!.getActiveObject()!.snapAngle = 15;
    else fabricCanvas!.getActiveObject()!.snapAngle = 0;
    e.target!.hasControls = false;
    dashboardStore.setActiveObjectRotation(
      parseFloat(fabricCanvas!.getActiveObject()?.angle?.toFixed() || "")
    );
  });

  fabricCanvas.renderAll();

  createToast("✅ App successfully started!", colors.green.darken1);
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
  height: 45px;
}

.layers-ctr {
  height: 195px;
}

.layer-item {
  min-height: 40px;
}

.bottom {
  bottom: 15px;
  position: absolute;
}

#seek-hover {
  height: 100%;
  background-color: #fff;
  width: 3px;
  opacity: 0.3;
  pointer-events: none;
  top: 0px;
  z-index: 99999999;
  position: absolute;
  border-radius: 5px;
}

#seekbar {
  height: 100%;
  width: 2px;
  background-color: #fff;
  position: absolute;
  z-index: 99999999;
  pointer-events: all;
  top: 0px;
}

#seekbar:hover {
  outline: 3px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

#seekbar:after {
  background: url(/seeker.svg);
  display: block;
  content: "";
  position: absolute;
  width: 13px;
  height: 18px;
  margin-left: -6px;
  margin-top: -10px;
  z-index: 9;
  box-sizing: border-box;
}

.seek-area {
  cursor: pointer;
}
</style>
