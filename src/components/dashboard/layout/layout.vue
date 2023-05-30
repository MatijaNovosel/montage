<template>
  <div
    class="border-l border-slate-700 flex flex-col p-5 items-center overflow-auto gap-2"
  >
    <template v-if="activeObject">
      <div class="text-slate-400 select-none">Vertical alignment</div>
      <div class="flex justify-center items-center">
        <v-btn
          @click="emit('align', ALIGN_OPTIONS.TOP)"
          v-tooltip="'Align top'"
          icon
          size="40"
        >
          <v-icon size="20" icon="mdi-format-vertical-align-top" />
        </v-btn>
        <v-btn
          @click="emit('align', ALIGN_OPTIONS.CENTER_V)"
          v-tooltip="'Align center'"
          class="mx-2"
          icon
          size="40"
        >
          <v-icon size="20" icon="mdi-format-vertical-align-center" />
        </v-btn>
        <v-btn
          @click="emit('align', ALIGN_OPTIONS.BOTTOM)"
          v-tooltip="'Align bottom'"
          icon
          size="40"
        >
          <v-icon size="20" icon="mdi-format-vertical-align-bottom" />
        </v-btn>
      </div>
      <div class="text-slate-400 select-none">Horizontal alignment</div>
      <div class="flex justify-center items-center">
        <v-btn
          @click="emit('align', ALIGN_OPTIONS.LEFT)"
          v-tooltip="'Align left'"
          icon
          size="40"
        >
          <v-icon size="20" icon="mdi-format-horizontal-align-left" />
        </v-btn>
        <v-btn
          @click="emit('align', ALIGN_OPTIONS.CENTER_H)"
          v-tooltip="'Align center'"
          class="mx-2"
          icon
          size="40"
        >
          <v-icon size="20" icon="mdi-format-horizontal-align-center" />
        </v-btn>
        <v-btn
          @click="emit('align', ALIGN_OPTIONS.RIGHT)"
          v-tooltip="'Align right'"
          icon
          size="40"
        >
          <v-icon size="20" icon="mdi-format-horizontal-align-right" />
        </v-btn>
      </div>
      <div class="text-slate-400 select-none">Arrangement</div>
      <div class="flex justify-center items-center">
        <v-btn
          @click="emit('bring-forward')"
          v-tooltip="'Bring forward'"
          icon
          size="40"
          class="mr-2"
        >
          <v-icon size="20" icon="mdi-arrange-bring-forward" />
        </v-btn>
        <v-btn
          @click="emit('send-backward')"
          v-tooltip="'Send backwards'"
          icon
          size="40"
        >
          <v-icon size="20" icon="mdi-arrange-send-backward" />
        </v-btn>
      </div>
      <template v-if="activeObject.type === 'textbox'">
        <div class="text-slate-400 select-none">Font settings</div>
        <div class="flex items-center justify-center w-full">
          <div class="w-4/12">Font</div>
          <v-select
            hide-details
            density="compact"
            placeholder="Font"
            variant="solo"
            :items="fontOptions"
          />
        </div>
      </template>
      <div class="text-slate-400 select-none">Active object settings</div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Width</div>
        <v-text-field
          v-model="activeObjectWidth"
          readonly
          suffix="px"
          placeholder="Width"
          variant="solo"
          hide-details
          density="compact"
        />
      </div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Height</div>
        <v-text-field
          v-model="activeObjectHeight"
          readonly
          suffix="px"
          placeholder="Width"
          variant="solo"
          hide-details
          density="compact"
        />
      </div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Duration</div>
        <v-text-field
          v-model="activeObjectHeight"
          readonly
          suffix="s"
          placeholder="Width"
          variant="solo"
          hide-details
          density="compact"
        />
      </div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Opacity</div>
        <v-slider
          :min="0"
          :max="1"
          :step="0.1"
          hide-details
          v-model="state.opacity"
          thumb-label
          show-ticks="always"
          class="w-8/12"
        />
      </div>
      <div class="flex flex-col items-center w-full">
        <degree-picker
          active-color="#4979f3"
          body-color="#2c354c"
          width="200"
          v-model="state.rotation"
        />
      </div>
    </template>
    <template v-else>
      <div class="text-slate-400 select-none">Canvas settings</div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Width</div>
        <v-text-field
          suffix="px"
          v-model.number="state.width"
          variant="solo"
          placeholder="Width"
          hide-details
          density="compact"
        />
      </div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Height</div>
        <v-text-field
          suffix="px"
          variant="solo"
          hide-details
          density="compact"
          v-model.number="state.height"
          placeholder="Height"
        />
      </div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Duration</div>
        <v-text-field
          variant="solo"
          hide-details
          density="compact"
          suffix="s"
          placeholder="Duration"
          v-model="state.duration"
        />
      </div>
      <v-color-picker
        hide-sliders
        v-model="state.color"
        mode="hexa"
        width="100%"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { SelectItem } from "@/models/common";
import { FontItem, FontResponse } from "@/models/font";
import { useDashboardStore } from "@/store/dashboard";
import { useToastStore } from "@/store/toast";
import { ALIGN_OPTIONS } from "@/utils/constants";
import axios from "axios";
import { DegreePicker } from "degree-picker";
import "degree-picker/dist/style.css";
import { storeToRefs } from "pinia";
import { computed, onMounted, reactive, watch } from "vue";
import WebFont from "webfontloader";

interface State {
  color: string;
  width: number;
  duration: number;
  height: number;
  fonts: FontItem[];
  opacity: number;
  rotation: number;
}

const dashboardStore = useDashboardStore();

const {
  artboardColor,
  artboardWidth,
  artboardHeight,
  activeObject,
  activeObjectHeight,
  activeObjectWidth,
  activeObjectRotation,
  activeObjectOpacity
} = storeToRefs(dashboardStore);

const { createToast } = useToastStore();

const emit = defineEmits([
  "align",
  "send-forward",
  "bring-backward",
  "bring-forward",
  "send-backward"
]);

const state: State = reactive({
  color: artboardColor.value,
  width: artboardWidth.value,
  height: artboardHeight.value,
  opacity: 1,
  rotation: 0,
  duration: 10,
  fonts: []
});

const fontOptions = computed(() =>
  state.fonts.map<SelectItem<string>>(({ family }) => ({
    title: family,
    value: family
  }))
);

watch(
  () => state.color,
  (val) => dashboardStore.setArtboardColor(val)
);

// Artboard width and height 2 way
watch(
  () => [state.width, state.height],
  (val) => dashboardStore.setArtboardDimensions(val[0], val[1])
);

// Opacity 2 way
watch(
  () => state.opacity,
  (val) => dashboardStore.setActiveObjectOpacity(val)
);

watch(activeObjectOpacity, (val) => (state.opacity = val));

// Rotation 2 way
watch(
  () => state.rotation,
  (val) => dashboardStore.setActiveObjectRotation(val)
);

watch(activeObjectRotation, (val) => (state.rotation = val));

onMounted(async () => {
  const { data } = await axios.get<FontResponse>(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${
      import.meta.env.VITE_GOOGLE_FONTS_API_KEY
    }&sort=alpha`
  );
  state.fonts = data.items.slice(0, 25);
  WebFont.load({
    google: {
      families: state.fonts.map((f) => f.family)
    }
  });
  createToast("✅ Fonts loaded!", "#3F7040");
});
</script>

<style>
.v-slider-thumb {
  visibility: hidden;
}
</style>
