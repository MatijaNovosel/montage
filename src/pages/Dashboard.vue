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
        class="bottom bg-black bg-opacity-50 px-4 py-2 rounded-lg z-10 text-2xl"
      >
        {{ formatTime(state.currentTime) }}
      </div>
      <main ref="main" class="h-full w-full">
        <canvas class="block" ref="canvas" />
      </main>
    </div>
    <layout
      @bring-forward="shiftLayer(true)"
      @send-backward="shiftLayer(false)"
      @align="(option)=> alignActiveObject(fabricCanvas!.getActiveObject(), option, artBoard, fabricCanvas)"
      class="w-2/12"
    />
  </div>
  <div class="flex bg-zinc-900 text-white border-zinc-700 bottom-area-ctr">
    <layer-list
      :layers="layers"
      :active-object-id="activeObjectId"
      @set-active-obj="setActiveObject"
    />
    <div class="h-full flex-grow relative overflow-auto">
      <hoverbar
        :offset="state.seekHoverOffset"
        :opacity="state.seeking ? 0.3 : 0"
      />
      <endbar :offset="state.duration / 10 - 15" />
      <seekbar :offset="state.seekbarOffset" />
      <time-ticks :duration="Math.floor(state.duration / 1000)" />
      <timeline
        @drag="dragObjectProps"
        @follow-cursor="followCursor"
        @hide-seekbar="state.seeking = false"
        @seek="seek"
      />
    </div>
  </div>
  <controls
    :disabled="disabled"
    :paused="paused"
    :timeline-scale="state.timelineScale"
    :playback-speed="state.playbackSpeed"
    :output-format="state.outputFormat"
    @seek-to-start="seekToStart"
    @seek-to-end="null"
    @toggle-play="togglePlay"
    @export="$export"
  />
</template>

<script setup lang="ts">
import Controls from "@/components/dashboard/Controls.vue";
import Endbar from "@/components/dashboard/Endbar.vue";
import Hoverbar from "@/components/dashboard/Hoverbar.vue";
import LayerList from "@/components/dashboard/LayerList.vue";
import Seekbar from "@/components/dashboard/Seekbar.vue";
import TimeTicks from "@/components/dashboard/TimeTicks.vue";
import Timeline from "@/components/dashboard/Timeline.vue";
import Layout from "@/components/dashboard/layout/layout.vue";
import Sidebar from "@/components/dashboard/sidebar/sidebar.vue";
import { AssetEvent, Layer } from "@/models/common";
import { useDashboardStore } from "@/store/dashboard";
import { useToastStore } from "@/store/toast";
import {
  DEFAULT_ASSET_DURATION,
  DEFAULT_DURATION,
  DRAWER_WIDTH,
  LAYER_TYPE,
  MAX_ALLOWED_VIDEO_DURATION,
  OUTPUT_FORMAT_OPTIONS,
  TIME_OPTIONS
} from "@/utils/constants";
import {
  alignActiveObject,
  calculateTextWidth,
  centerLines,
  getObjectById,
  initializeFabric
} from "@/utils/fabric";
import {
  blobToBinary,
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
  useEventListener
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
  zoomLevel: number;
  playbackSpeed: number;
  outputFormat: string;
  newLayer: Layer | null;
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
  layers,
  paused
} = storeToRefs(dashboardStore);

const state: State = reactive({
  timelineScale: 0,
  playInterval: null,
  zoomLevel: 100,
  layers: [],
  playbackSpeed: TIME_OPTIONS[1].value,
  outputFormat: OUTPUT_FORMAT_OPTIONS[1].value,
  newLayer: null,
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

const $export = async () => {
  const installed = await invoke<boolean>("ffmpegInstalled");
  if (!installed) {
    createToast("Cannot render, ffmpeg is not installed!", colors.red.darken1);
    return;
  }
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
    } else {
      createToast("🚨 Failed to capture any chunks!", colors.red.darken3);
    }
    fabricCanvas?.renderAll();
    dashboardStore.setLoading(false);
    recorder = null;
    createToast("🛑 Rendering finished!", colors.purple.darken1);
  };
  dashboardStore.setLoading(true);
  if (!paused.value) {
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
    if (paused.value) {
      state.playInterval = setInterval(() => {
        if (state.currentTime + 1 > state.duration) {
          seekToStart();
          togglePlay();
          return;
        }
        videoObjects.value.forEach((v) => {
          // @ts-ignore
          const element = v.object.getElement();
          if (isLayerVisible(v, false)) {
            element.muted = false;
            element.play();
          } else if (isLayerVisible(v, true) && v.startTrim > 0) {
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
    dashboardStore.setPaused(!paused.value);
  }
};

const shiftLayer = (forward: boolean) => {
  const obj = fabricCanvas?.getActiveObject();
  if (obj) {
    //@ts-ignore
    const id = obj.get("id");
    const layerIdx = layers.value.findIndex((l) => l.id === id);
    if (layerIdx !== -1) {
      if (forward && layerIdx - 1 >= 0) {
        move(layers.value, layerIdx, layerIdx - 1);
        obj.bringForward();
      } else if (!forward && layerIdx + 1 < layers.value.length) {
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
    cursorDelay: 250,
    width: calculateTextWidth(
      fabricCanvas!.getContext(),
      text,
      `${fontWeight} ${fontSize}px Roboto`
    ),
    // @ts-ignore
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
  if (!paused.value) return;

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

const isLayerVisible = (layer: Layer, noTrim: boolean) => {
  let layerOffsetMs = layer.offset * 10 + layer.startTrim * 10;
  if (noTrim) {
    layerOffsetMs = layer.offset * 10;
    return (
      state.currentTime >= layerOffsetMs &&
      state.currentTime <= layerOffsetMs + layer.duration
    );
  } else {
    const duration = layer.duration - layer.startTrim * 10 - layer.endTrim * 10;
    return (
      state.currentTime >= layerOffsetMs &&
      state.currentTime <= layerOffsetMs + duration
    );
  }
};

const updateLayerVisibility = () => {
  // @ts-ignore
  const activeObjectId: string = fabricCanvas?.getActiveObject()?.get("id");
  for (const layer of layers.value) {
    // @ts-ignore
    const objectId: string = layer.object?.get("id");
    layer.object!.visible = false;
    if (isLayerVisible(layer, false)) {
      layer.object!.visible = true;
    } else {
      layer.object!.visible = false;
      if (objectId === activeObjectId) {
        fabricCanvas?.discardActiveObject().renderAll();
      }
    }
  }
};

const seekToStart = () => {
  state.currentTime = 0;
  videoObjects.value.forEach((v) => {
    // @ts-ignore
    v.object.getElement().currentTime = 0;
  });
};

const seek = (e: MouseEvent) => {
  const res = e.pageX - DRAWER_WIDTH;
  if (res > 1 && !!layers.value.length) {
    state.currentTime = res * 10;
    videoObjects.value.forEach((v) => {
      // @ts-ignore
      const element = v.object.getElement();
      if (isLayerVisible(v, false)) {
        const elementCurrTime = state.currentTime - v.offset * 10; // Miliseconds
        element.currentTime = elementCurrTime / 1000; // Seconds
      } else {
        element.currentTime = 0;
      }
    });
  }
};

const dragObjectProps = (down: MouseEvent, layer: Layer) => {
  if (!paused.value) return;

  const baseWidth = layer.duration / 10; // full untrimmed width

  // Snapshot starting values
  const start = {
    pageX: down.pageX,
    offset: layer.offset,
    startTrim: layer.startTrim,
    endTrim: layer.endTrim
  };
  const visible = baseWidth - start.startTrim - start.endTrim;
  const leftEdge = start.offset + start.startTrim;
  const rightEdge = start.offset + visible;

  let action: "dragging" | "trimLeft" | "trimRight" = "dragging";
  if (down.offsetX <= 7) action = "trimLeft";
  else if (down.offsetX >= visible - 7) action = "trimRight";

  const minVisible = 0;
  const minLeftEdge = start.offset;
  const maxRightEdge = start.offset + (baseWidth - start.startTrim);

  const onMove = (move: MouseEvent) => {
    const dx = move.pageX - start.pageX;

    state.dragging = true;
    state.seeking = false;

    if (action === "dragging") {
      layer.offset = Math.max(0, start.offset + dx);
      return;
    }

    if (action === "trimLeft") {
      const maxLeftEdge =
        start.offset + (baseWidth - start.endTrim - minVisible);
      const newLeftEdge = Math.min(
        Math.max(leftEdge + dx, minLeftEdge),
        maxLeftEdge
      );
      layer.startTrim = newLeftEdge - start.offset;
      return;
    }

    const minRightEdge = start.offset + minVisible;
    const newRightEdge = Math.max(
      Math.min(rightEdge + dx, maxRightEdge),
      minRightEdge
    );

    const newVisible = newRightEdge - start.offset;
    layer.endTrim = baseWidth - start.startTrim - newVisible;
  };

  const onUp = () => {
    state.dragging = false;
    state.seeking = true;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    updateLayerVisibility();
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
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
        createToast("Layer removed", colors.purple.darken1);
      }
      // Copy
      if (e.ctrlKey && e.key === "c") {
        const newLayer = structuredClone(layer);
        const id = randInt(1, 9999).toString();
        newLayer.id = id;
        state.newLayer = newLayer;
        createToast("Layer copied", colors.purple.darken1);
      }
      // Paste
      if (e.ctrlKey && e.key === "v" && state.newLayer) {
        dashboardStore.addLayer(state.newLayer);
        state.newLayer = null;
        createToast("New layer created", colors.purple.darken1);
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
  if (zoom < 0.1) {
    zoom = 0.1;
  }
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
  state.zoomLevel = fabricCanvas!.getZoom() * 100;
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
