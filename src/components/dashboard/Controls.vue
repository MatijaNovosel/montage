<template>
  <div
    class="flex justify-between items-center bg-zinc-700 text-white px-5"
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
        @click="emit('seek-to-start')"
      />
      <v-btn
        :disabled="disabled"
        :icon="paused ? 'mdi-play' : 'mdi-pause'"
        variant="text"
        @click="emit('toggle-play')"
      />
      <v-btn
        :disabled="disabled"
        icon="mdi-skip-forward"
        variant="text"
        @click="emit('seek-to-end')"
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
      <v-btn
        class="ml-3"
        :disabled="disabled"
        @click="emit('export')"
        color="blue"
      >
        Export
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { OUTPUT_FORMAT_OPTIONS, TIME_OPTIONS } from "@/utils/constants";
import { reactive } from "vue";

const props = defineProps<{
  disabled: boolean;
  paused: boolean;
  timelineScale: number;
  playbackSpeed: number;
  outputFormat: string;
}>();

const state = reactive({
  timelineScale: props.timelineScale,
  playbackSpeed: props.playbackSpeed,
  outputFormat: props.outputFormat
});

const emit = defineEmits<{
  (e: "seek-to-start"): void;
  (e: "seek-to-end"): void;
  (e: "toggle-play"): void;
  (e: "export"): void;
}>();
</script>
