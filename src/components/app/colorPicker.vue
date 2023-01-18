<template>
  <div class="bg-slate-900 flex justify-center items-center w-full">
    <input v-model="color" type="color" id="head" name="head" />
    <div
      class="px-3 h-full bg-slate-800 rounded-r-md flex justify-center items-center w-full py-1"
    >
      {{ color.toUpperCase() }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const color = ref<string>(props.modelValue);

const emit = defineEmits(["update:modelValue"]);

watch(color, (val) => {
  emit("update:modelValue", val);
});
</script>
