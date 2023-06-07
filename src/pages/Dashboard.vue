<template>
  <canvas
    class="absolute hidden"
    :width="artboardWidth"
    :height="artboardHeight"
    ref="recordCanvas"
  />
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
          <v-btn @click="redo">
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
        {{ formatTime(state.currentTime) }}
      </div>
      <main ref="main" class="h-full w-full">
        <canvas class="block" ref="canvas" />
      </main>
    </div>
    <layout
      @bring-forward="bringForward(fabricCanvas?.getActiveObject())"
      @send-backward="sendBackwards(fabricCanvas?.getActiveObject())"
      @align="alignActiveObject"
      class="w-2/12"
    />
  </div>
  <div class="flex bg-slate-900 text-white border-slate-700 bottom-area-ctr">
    <div
      class="flex flex-col h-full border-r border-slate-700 overflow-auto"
      :style="{ width: `${DRAWER_WIDTH}px` }"
    >
      <div
        class="flex items-center border-slate-700 border-y pl-4 py-3 text-slate-500 select-none tracking-widest"
      >
        LAYERS
      </div>
      <template v-if="layers.length">
        <div
          class="pl-4 cursor-pointer layer-item flex items-center border-b-2 border-slate-800"
          v-for="(layer, i) of layers"
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
            {{ `${layer.type} ${layer.id}` }}
          </span>
        </div>
      </template>
      <div class="p-5" v-else>No layers added.</div>
    </div>
    <div class="h-full flex-grow relative overflow-auto">
      <div
        id="seek-hover"
        :style="{
          opacity: state.seeking ? 0.3 : 0,
          left: `${state.seekHoverOffset}px`
        }"
      />
      <div
        id="video-duration-end-bar"
        :style="{
          left: `${state.duration / 10 - 15}px`
        }"
      />
      <div
        id="seekbar"
        :style="{
          left: `${state.seekbarOffset}px`
        }"
      />
      <div class="flex items-center py-3 relative border-y border-slate-700">
        <!-- Full seconds -->
        <span
          class="text-slate-400 text-right select-none"
          :key="n"
          v-for="n in Math.floor(state.duration / 1000)"
          :style="{
            width: '100px'
          }"
        >
          {{ n }}s
        </span>
        <!-- Half seconds -->
        <span
          class="text-slate-400 select-none absolute"
          :key="n"
          v-for="n in Math.floor(state.duration / 1000) * 2"
          :style="{
            left: `${50 * n - 5}px`,
            display: !(n % 2) ? 'none' : undefined
          }"
        >
          •
        </span>
      </div>
      <!-- Timeline -->
      <div
        @mousemove="followCursor"
        @mouseleave="hideSeekbar"
        @click="seek"
        class="flex flex-col timeline-body"
        v-if="layers.length"
      >
        <div
          @mousedown.prevent="(e) => dragObjectProps(e, layer)"
          class="main-row relative border-b-2 border-slate-800"
          :class="{
            'border-y-2': i === 0,
            'border-b-2': i > 0
          }"
          v-for="(layer, i) of layers"
          :key="layer.id"
          :style="{
            width: calculateLayerWidth(layer),
            left: `${layer.offset}px`
          }"
        >
          <div class="row-element">
            <div
              :style="{
                width: `${
                  layer.duration / 10 - layer.startTrim - layer.endTrim
                }px`,
                left: `${layer.startTrim}px`
              }"
              class="trim-row absolute"
              :class="{
                [`bg-${LAYER_TYPE_COLOR[layer.type]}`]: true
              }"
            />
          </div>
        </div>
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
        :disabled="disabled"
      />
      <span> ⬜ </span>
      <v-select
        class="ml-3 w-5/12"
        density="compact"
        hide-details
        variant="solo"
        :items="TIME_OPTIONS"
        v-model="state.playbackSpeed"
        :disabled="disabled"
      />
    </div>
    <div class="flex justify-center items-center w-6/12">
      <v-btn
        :disabled="disabled"
        icon="mdi-skip-forward"
        class="scale-x-n1"
        variant="text"
        @click="seekToStart"
      />
      <v-btn
        :disabled="disabled"
        :icon="state.paused ? 'mdi-play' : 'mdi-pause'"
        variant="text"
        @click="togglePlay"
      />
      <v-btn
        :disabled="disabled"
        icon="mdi-skip-forward"
        variant="text"
        @click="seekToEnd"
      />
    </div>
    <div class="flex justify-end items-center w-3/12">
      <v-select
        density="compact"
        hide-details
        variant="solo"
        :items="OUTPUT_FORMAT_OPTIONS"
        v-model="state.outputFormat"
        :disabled="disabled"
        class="w-9/12"
      />
      <v-btn class="ml-3" :disabled="disabled" @click="$export" color="blue">
        Export
      </v-btn>
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
  DEFAULT_ASSET_DURATION,
  DEFAULT_DURATION,
  DRAWER_WIDTH,
  LAYER_TYPE,
  LAYER_TYPE_COLOR,
  LAYER_TYPE_ICON,
  MAX_ALLOWED_VIDEO_DURATION,
  OUTPUT_FORMAT_OPTIONS,
  TIME_OPTIONS
} from "@/utils/constants";
import {
  calculateTextWidth,
  centerLines,
  getObjectById,
  initializeFabric
} from "@/utils/fabric";
import {
  blobToBinary,
  bytesToMB,
  calculateLayerWidth,
  formatTime,
  getFileExtension,
  move,
  readFile
} from "@/utils/helpers";
import { invoke } from "@tauri-apps/api";
import { save } from "@tauri-apps/api/dialog";
import { BaseDirectory, removeFile, writeBinaryFile } from "@tauri-apps/api/fs";
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
// @ts-ignore-line
import colors from "vuetify/lib/util/colors";

interface State {
  timelineScale: number;
  zoomLevel: string;
  playbackSpeed: SelectItem<number>;
  outputFormat: SelectItem<string>;
  newLayer: Layer | null;
  paused: boolean;
  dragging: boolean;
  trimming: boolean;
  // NOTE: Miliseconds
  currentTime: number;
  // NOTE: Miliseconds
  duration: number;
  seekHoverOffset: number;
  seekbarOffset: number;
  playInterval: ReturnType<typeof setInterval> | null;
  seeking: boolean;
}

const dashboardStore = useDashboardStore();
const { createToast } = useToastStore();
const addAssetBus = useEventBus<AssetEvent>("asset");

const {
  artboardColor,
  artboardHeight,
  artboardWidth,
  activeObjectId,
  loading,
  layers
} = storeToRefs(dashboardStore);

const state: State = reactive({
  timelineScale: 0,
  playInterval: null,
  zoomLevel: "100%",
  layers: [],
  playbackSpeed: TIME_OPTIONS[1],
  outputFormat: OUTPUT_FORMAT_OPTIONS[1],
  newLayer: null,
  paused: true,
  dragging: false,
  trimming: false,
  // NOTE: Miliseconds
  currentTime: 0,
  // NOTE: Miliseconds
  duration: DEFAULT_DURATION,
  seeking: false,
  seekHoverOffset: 0,
  seekbarOffset: 0
});

const canvas = ref<HTMLCanvasElement | null>(null);
const main = ref<HTMLElement | null>(null);
const recordCanvas = ref<HTMLCanvasElement | null>(null);

let fabricCanvas: fabric.Canvas | null = null;
let artBoard: fabric.Rect | null = null;
let lineH: fabric.Line | null = null;
let lineV: fabric.Line | null = null;
let centerCircle: fabric.Circle | null = null;

let recorder: MediaRecorder | null = null;

const { width: mainWidth, height: mainHeight } = useElementSize(main);
const { memory } = useMemory();

// Computed properties
const videoObjects = computed(() =>
  layers.value.filter((l) => l.type === LAYER_TYPE.VIDEO)
);

const artBoardLeft = computed(() => artBoard?.get("left") as number);
const artBoardTop = computed(() => artBoard?.get("top") as number);
const disabled = computed(() => !layers.value.length || loading.value);

// Functions
const undo = () => {
  createToast("🚨 Undo", colors.red.darken1);
};

const redo = () => {
  createToast("🚨 Redo", colors.green.darken1);
};

const drawImage = () => {
  const canvas = fabricCanvas?.getElement() as HTMLCanvasElement;
  const ctx = recordCanvas.value!.getContext("2d");
  ctx!.drawImage(
    canvas,
    -((mainWidth.value - artboardWidth.value) / 2),
    -((mainHeight.value - artboardHeight.value) / 2)
  );
};

const convertFile = async (content?: Uint8Array) => {
  try {
    await writeBinaryFile("output.webm", content as Uint8Array, {
      dir: BaseDirectory.Temp
    });
    const [originPath, convertedPath] = await invoke<string[]>("convert", {
      fileName: "output.webm"
    });
    const savePath = await save({
      title: "Save video",
      filters: [
        {
          name: "Video",
          extensions: ["mp4"]
        }
      ]
    });
    await invoke("save", {
      convertedPath,
      savePath
    });
    await removeFile(originPath);
    createToast("File saved!", colors.green.lighten1);
  } catch (e: any) {
    createToast(e, colors.red.darken1);
  }
};

const $export = () => {
  const chunks: Blob[] = [];
  const stream = recordCanvas.value!.captureStream(60);
  recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
    bitsPerSecond: 3200000
  });
  /*
  TODO: Fix audio
  videoObjects.value.forEach((video) => {
    // @ts-ignore
    const element = video.object.getElement();
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaElementSource(element);
    const audioDestination = audioContext.createMediaStreamDestination();
    audioSource.connect(audioDestination);
    stream.addTrack(audioDestination.stream.getAudioTracks()[0]);
  });
  */
  recorder.ondataavailable = ({ data }) => {
    if (data.size > 0) {
      chunks.push(data);
    }
  };
  recorder.onstop = async () => {
    if (!!chunks.length) {
      createToast("🌟 Video successfully rendered!", colors.green.darken1);
      const output = new Blob(chunks, { type: recorder?.mimeType });
      const res = await blobToBinary(output);
      convertFile(res);
      // saveBlob(output, `${new Date().toISOString().replaceAll(":", "-")}.webm`);
    } else {
      createToast("🚨 Failed to capture any chunks!", colors.red.darken3);
    }
    fabricCanvas?.renderAll();
    dashboardStore.setLoading(false);
    recorder = null;
    createToast("🛑 Rendering finished!", colors.purple.darken1);
  };
  dashboardStore.setLoading(true);
  if (!state.paused) {
    togglePlay();
  }
  fabricCanvas?.discardActiveObject().renderAll();
  state.currentTime = 0;
  togglePlay();
  recorder.start();
  setTimeout(() => {
    recorder?.stop();
  }, state.duration);
};

// NOTE: Videos will not animate properly if this is not used
const render = () => {
  if (recorder && recorder.state === "recording") {
    drawImage();
  }
  fabricCanvas?.renderAll();
  requestAnimationFrame(render);
};

requestAnimationFrame(render);

const pauseVideos = async () => {
  videoObjects.value.forEach((v) => {
    // @ts-ignore
    v.object.getElement().pause();
    fabricCanvas?.renderAll();
  });
};

const togglePlay = () => {
  if (!!layers.value.length) {
    if (state.paused) {
      state.playInterval = setInterval(() => {
        if (state.currentTime + 1 > state.duration) {
          seekToStart();
          togglePlay();
          return;
        }
        videoObjects.value.forEach((v) => {
          // @ts-ignore
          const element = v.object.getElement();
          if (isLayerVisible(v)) {
            element.muted = false;
            element.play();
          } else if (isLayerVisibleNoTrim(v) && v.startTrim > 0) {
            element.muted = true;
            element.play();
          } else {
            element.pause();
          }
        });
        state.currentTime += 10;
      }, 10);
    } else {
      if (state.playInterval) {
        clearInterval(state.playInterval);
      }
      pauseVideos();
    }
    state.paused = !state.paused;
  }
};

const bringForward = (obj: fabric.Object | null | undefined) => {
  if (obj) {
    //@ts-ignore
    const id = obj.get("id");
    const layerIdx = layers.value.findIndex((l) => l.id === id);
    if (layerIdx !== -1) {
      if (layerIdx - 1 >= 0) {
        move(layers.value, layerIdx, layerIdx - 1);
        obj.bringForward();
      }
    }
  }
};

const sendBackwards = (obj: fabric.Object | null | undefined) => {
  if (obj) {
    //@ts-ignore
    const id = obj.get("id");
    const layerIdx = layers.value.findIndex((l) => l.id === id);
    if (layerIdx !== -1) {
      if (layerIdx + 1 < layers.value.length) {
        move(layers.value, layerIdx, layerIdx + 1);
        obj.sendBackwards();
      }
    }
  }
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
    width: calculateTextWidth(
      fabricCanvas!.getContext(),
      text,
      `${fontWeight} ${fontSize}px Roboto`
    ),
    id
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
  dashboardStore.addLayer({
    id,
    object: newText,
    type: LAYER_TYPE.TEXT,
    endTrim: 0,
    offset: 0,
    startTrim: 0,
    duration: DEFAULT_ASSET_DURATION
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
    svgData.id = id;
    fabricCanvas?.add(svgData);
    fabricCanvas?.setActiveObject(svgData);
    dashboardStore.addLayer({
      id,
      object: svgData,
      type: LAYER_TYPE.IMAGE,
      endTrim: 0,
      offset: 0,
      startTrim: 0,
      duration: DEFAULT_ASSET_DURATION
    });
  });
};

const newImage = async (source: File | string) => {
  const id = randInt(1, 9999).toString();
  if (typeof source !== "string") {
    source = await readFile(source);
  }
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
    image.set("id", id);
    fabricCanvas?.add(image);
    fabricCanvas?.bringToFront(image);
    fabricCanvas?.setActiveObject(image);
    fabricCanvas?.renderAll();
    dashboardStore.addLayer({
      id,
      object: image,
      type: LAYER_TYPE.IMAGE,
      endTrim: 0,
      offset: 0,
      startTrim: 0,
      duration: DEFAULT_ASSET_DURATION
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
    crossOrigin: "anonymous",
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
    id,
    objectCaching: false,
    inGroup: false
  });
  //@ts-ignore
  newVideo.saveElem = newVideo.getElement();
  fabricCanvas?.add(newVideo);
  if ((newVideo.get("width") as number) > artboardWidth.value) {
    newVideo.scaleToWidth(artboardWidth.value);
  }
  if (duration * 1000 > state.duration) {
    state.duration = duration * 1000;
  }
  newVideo.scaleToWidth(artboardHeight.value);
  fabricCanvas?.renderAll();
  fabricCanvas?.setActiveObject(newVideo);
  fabricCanvas?.bringToFront(newVideo);
  fabricCanvas?.renderAll();
  //@ts-ignore
  newVideo.set("id", id);
  dashboardStore.addLayer({
    id,
    object: newVideo,
    type: LAYER_TYPE.VIDEO,
    endTrim: 0,
    offset: 0,
    startTrim: 0,
    duration: duration * 1000
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
        if (vidObj.duration * 1000 < MAX_ALLOWED_VIDEO_DURATION) {
          newVideo(vidObj, src, vidObj.duration);
        } else {
          createToast(
            "🚨 Video duration too long, <10s allowed!",
            colors.red.darken1
          );
        }
      } else {
        setTimeout(waitLoad, 100);
      }
    };
    setTimeout(waitLoad, 100);
  });
};

const addAsset = async (event: AssetEvent) => {
  switch (event.type) {
    case LAYER_TYPE.EMOJI:
      newSvg(`/emojis/${event.value}.svg`);
      break;
    case LAYER_TYPE.VIDEO:
      loadVideo(`/videos/${event.value}.mp4`);
      break;
    case LAYER_TYPE.SHAPE:
      newSvg(`/shapes/${event.value}.svg`);
      break;
    case LAYER_TYPE.IMAGE:
      newImage(`/images/${event.value}.jpg`);
      break;
    case LAYER_TYPE.UPLOAD:
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
    case LAYER_TYPE.TEXT:
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

const unsubscribeAddAssetBus = addAssetBus.on(addAsset);

const isLayerVisible = (layer: Layer) => {
  const layerOffsetMs = layer.offset * 10 + layer.startTrim * 10;
  const duration = layer.duration - layer.startTrim * 10 - layer.endTrim * 10;
  return (
    state.currentTime >= layerOffsetMs &&
    state.currentTime <= layerOffsetMs + duration
  );
};

const isLayerVisibleNoTrim = (layer: Layer) => {
  const layerOffsetMs = layer.offset * 10;
  return (
    state.currentTime >= layerOffsetMs &&
    state.currentTime <= layerOffsetMs + layer.duration
  );
};

const updateLayerVisibility = () => {
  // @ts-ignore
  const activeObjectId: string = fabricCanvas?.getActiveObject()?.get("id");
  for (const layer of layers.value) {
    // @ts-ignore
    const objectId: string = layer.object?.get("id");
    layer.object!.visible = false;
    if (isLayerVisible(layer)) {
      layer.object!.visible = true;
    } else {
      layer.object!.visible = false;
      if (objectId === activeObjectId) {
        fabricCanvas?.discardActiveObject().renderAll();
      }
    }
  }
};

const hideSeekbar = () => {
  state.seeking = false;
};

const seekToStart = () => {
  state.currentTime = 0;
  videoObjects.value.forEach((v) => {
    // @ts-ignore
    v.object.getElement().currentTime = 0;
  });
};

const seekToEnd = () => {};

const seek = (e: MouseEvent) => {
  const res = e.pageX - DRAWER_WIDTH;
  if (res > 1 && !!layers.value.length) {
    state.currentTime = res * 10;
    videoObjects.value.forEach((v) => {
      // @ts-ignore
      const element = v.object.getElement();
      if (isLayerVisible(v)) {
        const elementCurrTime = state.currentTime - v.offset * 10; // Miliseconds
        element.currentTime = elementCurrTime / 1000; // Seconds
      } else {
        element.currentTime = 0;
      }
    });
  }
};

const dragObjectProps = ({ offsetX }: MouseEvent, layer: Layer) => {
  let action = "dragging";
  const layerWidth = layer.duration / 10 - layer.endTrim - layer.startTrim;
  if (offsetX <= 7) {
    action = "trimLeft";
  } else if (offsetX >= layerWidth - 7) {
    action = "trimRight";
  }
  const dragging = ({ pageX }: MouseEvent) => {
    const offset = pageX - DRAWER_WIDTH;
    if (action === "dragging") {
      state.dragging = true;
      state.seeking = false;
      if (offset - 50 >= 0) {
        layer.offset = offset - 50;
      }
    } else if (action === "trimLeft") {
      const res = offset - layer.offset;
      if (res >= 0 && res < layerWidth) {
        layer.startTrim = res;
      }
    } else if (action === "trimRight") {
      // TODO: Fix this at some point
      const res = Math.abs(offset - layer.offset - layerWidth);
      if (res <= layerWidth) {
        layer.endTrim = Math.abs(res);
      }
    }
  };
  const released = () => {
    state.dragging = false;
    state.seeking = true;
    document.removeEventListener("mousemove", dragging);
    document.removeEventListener("mouseup", released);
    updateLayerVisibility();
  };
  document.addEventListener("mouseup", released);
  document.addEventListener("mousemove", dragging);
};

const followCursor = ({ pageX }: MouseEvent) => {
  if (state.dragging) return;
  state.seeking = true;
  const res = pageX - DRAWER_WIDTH;
  if (res > 1) {
    state.seekHoverOffset = res;
  }
};

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

const handleKeyDown = (e: KeyboardEvent) => {
  const activeObject = fabricCanvas?.getActiveObject();
  if (activeObject) {
    // @ts-ignore
    const id = activeObject.id;
    const layer = layers.value.find((l) => l.id === id);
    if (layer) {
      // Delete
      if (e.key === "Delete") {
        if (layer.type === LAYER_TYPE.VIDEO) {
          // TODO: Adjust total duration here
          state.duration = DEFAULT_DURATION;
        }
        dashboardStore.removeLayer(layer);
        fabricCanvas?.remove(activeObject);
        fabricCanvas?.discardActiveObject().renderAll();
      }
      // Copy
      if (e.ctrlKey && e.key === "c") {
        const newLayer = structuredClone(layer);
        const id = randInt(1, 9999).toString();
        newLayer.id = id;
        state.newLayer = newLayer;
      }
      // Paste
      if (e.ctrlKey && e.key === "v" && state.newLayer) {
        dashboardStore.addLayer(state.newLayer);
        state.newLayer = null;
      }
    }
  }
};

// Watchers
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

watch(
  () => state.currentTime,
  (val) => {
    state.seekbarOffset = val / 10;
    updateLayerVisibility();
  }
);

// Listeners
onKeyDown("Delete", () => {
  fabricCanvas?.getActiveObjects().forEach((obj) => {
    // @ts-ignore
    const id = obj.id;
    const layer = layers.value.find((l) => l.id === id);
    if (layer) {
      if (layer.type === LAYER_TYPE.VIDEO) {
        // TODO: Adjust total duration here
        state.duration = DEFAULT_DURATION;
      }
      dashboardStore.removeLayer(layer);
    }
    fabricCanvas?.remove(obj);
  });
  fabricCanvas?.discardActiveObject().renderAll();
});

document.addEventListener("keydown", handleKeyDown);

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

// Hooks
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
    if (e.e.shiftKey) {
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
    }
  });

  fabricCanvas.on("mouse:up", () => {
    lineH!.opacity = 0;
    lineV!.opacity = 0;
  });

  fabricCanvas.on("selection:updated", updateActiveObjectDimensions);
  fabricCanvas.on("selection:created", updateActiveObjectDimensions);

  fabricCanvas.on("selection:cleared", () =>
    dashboardStore.setActiveObject(null)
  );

  fabricCanvas.on("object:modified", (e) => {
    e.target!.hasControls = true;
    updateActiveObjectDimensions();
    fabricCanvas?.renderAll();
  });

  fabricCanvas.on("object:rotating", (e) => {
    if (e.e.shiftKey) {
      fabricCanvas!.getActiveObject()!.snapAngle = 15;
    } else {
      fabricCanvas!.getActiveObject()!.snapAngle = 5;
    }
    e.target!.hasControls = false;
    dashboardStore.setActiveObjectRotation(
      parseFloat(fabricCanvas!.getActiveObject()?.angle?.toFixed() || "")
    );
  });

  fabricCanvas.renderAll();
  createToast("🎉 Welcome to Montage!", colors.purple.darken1);
});

onBeforeUnmount(() => {
  wheelScrollEvent();
  unsubscribeAddAssetBus();
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped lang="scss">
@import "dashboard.scss";
</style>
