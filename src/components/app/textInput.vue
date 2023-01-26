<template>
  <div class="flex relative" :style="ctrStyle">
    <span class="suffix absolute select-none text-sm text-slate-400">
      {{ suffix }}
    </span>
    <input
      :style="inputStyle"
      :disabled="loading || !!error"
      :placeholder="placeholder"
      class="rounded-l-lg pl-3"
      :class="{
        [`bg-${backgroundColor}`]: true,
        'rounded-r-lg': !clearable
      }"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      type="search"
    />
    <div
      v-if="clearable"
      class="bg-slate-700 icon flex justify-center items-center rounded-r-lg px-3 hover:bg-slate-600 cursor-pointer"
    >
      <img height="30" width="30" src="/close.svg" @click="clearSearch" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from "vue";

const props = defineProps({
  modelValue: String,
  placeholder: String,
  loading: Boolean,
  clearable: {
    type: Boolean,
    default: false
  },
  suffix: String,
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

const inputStyle = computed(() => ({
  width: `calc(100% - ${props.clearable ? 20 : 0}px)`,
  fontSize: props.dense ? "14px" : "20px"
}));

const ctrStyle = computed(() => ({
  height: props.dense ? "30px" : "50px"
}));
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

.suffix {
  right: 15px;
  top: 5px;
}
</style>
