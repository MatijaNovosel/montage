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
      placeholder="Select"
      :options="options"
    />
    <m-text-input
      v-model="width"
      dense
      class="mt-3 w-full px-3"
      placeholder="Width"
    />
    <m-text-input
      v-model="height"
      dense
      class="mt-3 w-full px-3"
      placeholder="Height"
    />
    <color-picker v-model="color" class="mt-3" />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { SelectItem } from "../../../models/common";
import { useDashboardStore } from "../../../store/dashboard";
import { ALIGN_OPTIONS } from "../../../utils/constants";

const dashboardStore = useDashboardStore();
const { artboardColor, artHeight, artWidth } = storeToRefs(dashboardStore);

const color = ref(artboardColor.value);
const width = ref(artWidth.value.toString());
const height = ref(artHeight.value.toString());

defineEmits(["align"]);

watch(color, (val) => dashboardStore.setArtboardColor(val));

watch([width, height], (val) =>
  dashboardStore.setArtboardDimensions(val[0], val[1])
);

const options: SelectItem<number>[] = [
  {
    text: "A",
    value: 1
  },
  {
    text: "B",
    value: 2
  },
  {
    text: "C",
    value: 3
  },
  {
    text: "D",
    value: 4
  },
  {
    text: "E",
    value: 5
  }
];
</script>
