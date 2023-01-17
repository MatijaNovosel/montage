<template>
  <div
    class="flex"
    :style="{
      height: dense ? '30px' : '50px'
    }"
  >
    <input
      :style="{
        fontSize: dense ? '14px' : '20px',
        width: 'calc(100% - 20px)'
      }"
      :disabled="loading || !!error"
      :placeholder="placeholder"
      class="w-full rounded-l-lg pl-3"
      :class="{
        [`bg-${backgroundColor}`]: true
      }"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      type="search"
    />
    <div
      class="bg-slate-700 icon flex justify-center items-center rounded-r-lg px-3 hover:bg-slate-600 cursor-pointer"
    >
      <img height="30" width="30" src="/close.svg" @click="clearSearch" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";

defineProps({
  modelValue: String,
  placeholder: String,
  loading: Boolean,
  backgroundColor: {
    type: String,
    default: "slate-800"
  },
  error: Object as PropType<Error | boolean>,
  dense: Boolean
});

const emit = defineEmits(["update:modelValue"]);

const clearSearch = () => {
  emit("update:modelValue", "");
};
</script>

<style scoped>
input {
  -webkit-tap-highlight-color: transparent;
  color: rgb(193, 194, 197);
  outline: none;
}

.icon {
  width: 50px;
  -webkit-tap-highlight-color: transparent;
}

input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-results-button,
input[type="search"]::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
}
</style>
