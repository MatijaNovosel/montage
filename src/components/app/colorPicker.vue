<template>
  <input v-model="color" type="color" id="head" name="head" />
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
