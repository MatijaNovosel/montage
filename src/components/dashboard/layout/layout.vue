<template>
  <div class="border-l border-slate-700 flex flex-col p-5 items-center">
    <div class="mb-3 text-slate-400 select-none">Vertical alignment</div>
    <div class="flex justify-center items-center">
      <btn
        @click="$emit('align', ALIGN_OPTIONS.TOP)"
        v-tooltip="'Align top'"
        square
        background-color="indigo-500"
        :disabled="!activeObject"
      >
        <img src="/align/align-top.svg" />
      </btn>
      <btn
        @click="$emit('align', ALIGN_OPTIONS.CENTER_V)"
        v-tooltip="'Align center'"
        square
        class="mx-2 py-2"
        background-color="indigo-500"
        :disabled="!activeObject"
      >
        <img class="h-full w-full" src="/align/align-center-v.svg" />
      </btn>
      <btn
        @click="$emit('align', ALIGN_OPTIONS.BOTTOM)"
        v-tooltip="'Align bottom'"
        square
        background-color="indigo-500"
        :disabled="!activeObject"
      >
        <img src="/align/align-bottom.svg" />
      </btn>
    </div>
    <div class="mt-3 text-slate-400 select-none">Horizontal alignment</div>
    <div class="flex justify-center items-center mt-3">
      <btn
        @click="$emit('align', ALIGN_OPTIONS.LEFT)"
        v-tooltip="'Align left'"
        square
        background-color="indigo-500"
        :disabled="!activeObject"
      >
        <img src="/align/align-left.svg" />
      </btn>
      <btn
        @click="$emit('align', ALIGN_OPTIONS.CENTER_H)"
        v-tooltip="'Align center'"
        square
        background-color="indigo-500"
        class="mx-2 py-2"
        :disabled="!activeObject"
      >
        <img src="/align/align-center-h.svg" />
      </btn>
      <btn
        @click="$emit('align', ALIGN_OPTIONS.RIGHT)"
        v-tooltip="'Align right'"
        square
        background-color="indigo-500"
        :disabled="!activeObject"
      >
        <img src="/align/align-right.svg" />
      </btn>
    </div>
    <div class="mt-3 text-slate-400 select-none">Arrangement</div>
    <div class="flex justify-center items-center mt-3">
      <btn
        @click="$emit('bring-forward')"
        v-tooltip="'Bring forward'"
        square
        background-color="indigo-500"
        class="mx-2 py-2"
        :disabled="!activeObject"
      >
        <img src="/arrangement/bring-forwards.svg" />
      </btn>
      <btn
        @click="$emit('send-backward')"
        v-tooltip="'Send backwards'"
        square
        background-color="indigo-500"
        :disabled="!activeObject"
      >
        <img src="/arrangement/send-backwards.svg" />
      </btn>
    </div>
    <div class="mt-5 text-slate-400 select-none">Canvas settings</div>
    <div class="flex items-center my-3 w-full">
      <div class="w-4/12">Width</div>
      <text-input
        class="w-8/12"
        v-model="state.width"
        dense
        placeholder="Width"
      />
    </div>
    <div class="flex items-center w-full">
      <div class="w-4/12">Height</div>
      <text-input
        class="w-8/12"
        v-model="state.height"
        dense
        placeholder="Height"
      />
    </div>
    <div class="flex items-center mt-3 w-full">
      <div class="w-4/12">Color</div>
      <color-picker class="w-8/12" v-model="state.color" />
    </div>
    <div class="mt-5 text-slate-400 select-none">Font settings</div>
    <div class="flex items-center justify-center mt-5 w-full">
      <div class="w-4/12">Font</div>
      <m-select class="w-8/12" placeholder="Font" :options="fontOptions" />
    </div>
    <template v-if="activeObject">
      <div class="mt-5 text-slate-400 select-none">Active object settings</div>
      <div class="flex items-center my-3 w-full">
        <div class="w-4/12">Width</div>
        <text-input class="w-8/12" dense placeholder="Width" />
      </div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Height</div>
        <text-input class="w-8/12" dense placeholder="Height" />
      </div>
      <div class="flex items-center my-3 w-full">
        <div class="w-4/12">Rotation</div>
        <text-input class="w-8/12" dense placeholder="Rotation" />
      </div>
      <div class="flex items-center w-full">
        <div class="w-4/12">Opacity</div>
        <slider class="w-8/12" />
      </div>
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
import { storeToRefs } from "pinia";
import { computed, onMounted, reactive, watch } from "vue";

interface State {
  color: string;
  width: string;
  height: string;
  fonts: FontItem[];
}

const dashboardStore = useDashboardStore();
const { artboardColor, artBoardHeight, artBoardWidth, activeObject } =
  storeToRefs(dashboardStore);
const { createToast } = useToastStore();

defineEmits(["align", "send-forward", "bring-backward"]);

const state: State = reactive({
  color: artboardColor.value,
  width: artBoardWidth.value.toString(),
  height: artBoardHeight.value.toString(),
  fonts: []
});

const fontOptions = computed(() =>
  state.fonts.map<SelectItem<string>>((f) => ({
    text: f.family,
    value: f.family
  }))
);

watch(
  () => state.color,
  (val) => dashboardStore.setArtboardColor(val)
);

watch(
  () => [state.width, state.height],
  (val) => dashboardStore.setArtboardDimensions(val[0], val[1])
);

onMounted(async () => {
  const { data } = await axios.get<FontResponse>(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${
      import.meta.env.VITE_GOOGLE_FONTS_API_KEY
    }&sort=alpha`
  );
  state.fonts = data.items;
  createToast("✅ Fonts loaded!", "#3F7040");
});
</script>
