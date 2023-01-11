<template>
  <div
    class="bg-slate-900 w-full progress-bar rounded-lg relative flex-center"
    :style="progressBarContainerStyle"
  >
    <div
      class="bg-green-600 progress-bar absolute top-0 left-0"
      :style="style"
      :class="clsMain"
    />
    <div class="z-3">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  progress: {
    type: Number,
    default: 0
  },
  height: {
    type: Number,
    default: 10
  }
});

const style = computed(() => ({
  width: `${props.progress}%`,
  height: `${props.height}px`
}));

const clsMain = computed(() => ({
  "rounded-l-lg": props.progress < 100,
  "rounded-lg": props.progress === 100
}));

const progressBarContainerStyle = computed(() => ({
  height: `${props.height}px`
}));
</script>
