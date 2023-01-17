<template>
  <div class="border-l border-slate-700 flex flex-col pt-5 px-3 items-center">
    <div class="mb-3">Layout settings</div>
    <div class="flex justify-center items-center">
      <btn
        @click="$emit('align', ALIGN_OPTIONS.TOP)"
        v-tooltip="'Align top'"
        square
        background-color="slate-800"
      >
        <img src="/align/align-top.svg" />
      </btn>
      <btn
        @click="$emit('align', ALIGN_OPTIONS.CENTER_V)"
        v-tooltip="'Align center'"
        square
        class="mx-2 py-2"
        background-color="slate-800"
      >
        <img class="h-full w-full" src="/align/align-center-v.svg" />
      </btn>
      <btn
        @click="$emit('align', ALIGN_OPTIONS.BOTTOM)"
        v-tooltip="'Align bottom'"
        square
        background-color="slate-800"
      >
        <img src="/align/align-bottom.svg" />
      </btn>
    </div>
    <div class="flex justify-center items-center mt-3">
      <btn
        @click="$emit('align', ALIGN_OPTIONS.LEFT)"
        v-tooltip="'Align left'"
        square
        background-color="slate-800"
      >
        <img src="/align/align-left.svg" />
      </btn>
      <btn
        @click="$emit('align', ALIGN_OPTIONS.CENTER_H)"
        v-tooltip="'Align center'"
        square
        class="mx-2 py-2"
        background-color="slate-800"
      >
        <img src="/align/align-center-h.svg" />
      </btn>
      <btn
        @click="$emit('align', ALIGN_OPTIONS.RIGHT)"
        v-tooltip="'Align right'"
        square
        background-color="slate-800"
      >
        <img src="/align/align-right.svg" />
      </btn>
    </div>
    <m-select
      class="mt-4 w-full px-3"
      placeholder="Font"
      :options="fontOptions"
    />
    <text-input
      v-model="state.width"
      dense
      class="mt-3 w-full px-3"
      placeholder="Width"
    />
    <text-input
      v-model="state.height"
      dense
      class="mt-3 w-full px-3"
      placeholder="Height"
    />
    <color-picker v-model="state.color" class="mt-3" />
  </div>
</template>

<script lang="ts" setup>
import { SelectItem } from "@/models/common";
import { useDashboardStore } from "@/store/dashboard";
import { useToastStore } from "@/store/toast";
import { ALIGN_OPTIONS } from "@/utils/constants";
import axios from "axios";
import { storeToRefs } from "pinia";
import { computed, onMounted, reactive, watch } from "vue";

interface FontItem {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
  category: string;
  kind: string;
}

interface FontResponse {
  kind: string;
  items: FontItem[];
}

interface State {
  color: string;
  width: string;
  height: string;
  fonts: FontItem[];
}

const dashboardStore = useDashboardStore();
const { artboardColor, artHeight, artWidth } = storeToRefs(dashboardStore);
const { createToast } = useToastStore();

defineEmits(["align"]);

const state: State = reactive({
  color: artboardColor.value,
  width: artWidth.value.toString(),
  height: artHeight.value.toString(),
  fonts: []
});

const fontOptions = computed(() =>
  state.fonts.map<SelectItem<string>>((f) => ({
    text: f.family,
    value: ""
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
