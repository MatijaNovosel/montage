<template>
  <div
    class="w-full progress-bar rounded-lg relative flex items-center justify-center"
    :style="progressBarContainerStyle"
  >
    <input
      :style="rangeStyle"
      v-model="value"
      type="range"
      min="1"
      max="100"
      class="slider"
      @input="$emit('update:modelValue', value)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: Number,
  progress: {
    type: Number,
    default: 0
  },
  height: {
    type: Number,
    default: 10
  }
});

defineEmits(["update:modelValue"]);

const value = ref(props.progress);

const progressBarContainerStyle = computed(() => ({
  height: `${props.height}px`
}));

const rangeStyle = computed(() => ({
  background: `linear-gradient(to right, white 0%, white ${value.value}%, #554f4f ${value.value}%, #554f4f 100%)`
}));
</script>

<style scoped>
.slider {
  appearance: none;
  width: 100%;
  height: 3px;
  border-radius: 8px;
  background: #554f4f;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #5486d1;
  cursor: pointer;
}
</style>
