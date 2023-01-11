<template>
  <button
    class="px-3 rounded-md flex justify-center items-center"
    :class="{
      [`bg-${backgroundColor}`]: true,
      'py-3': square,
      'py-1': !square
    }"
    :style="style"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  backgroundColor: {
    type: String,
    default: "slate-800"
  },
  height: {
    type: Number
  },
  width: {
    type: Number
  },
  square: {
    type: Boolean
  }
});

const style = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`
}));
</script>
