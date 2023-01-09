<template>
  <div class="overlay-container" @dragover="dragOver" @drop="drop">
    <div
      class="w-full h-full bg-slate-700 absolute flex justify-center items-center z-50 overlay-indicator"
      v-show="draggingOver"
      @dragleave="dragLeave"
    >
      <h2 class="pointer-events-none text-white text-xl">
        {{ $t("dragFileHere") }}
      </h2>
    </div>
    <input type="file" @change="onChange" multiple hidden ref="filePicker" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, Ref, ref, watch } from "vue";
import { useToastStore } from "../store/toast";
import { MIME_TYPES } from "../utils/constants";
import { getFileExtension } from "../utils/helpers";

const draggingOver = ref(false);
const filePicker = ref<HTMLInputElement | null>(null);
const { createToast } = useToastStore();
const emit = defineEmits(["change"]);
const filePickerTrigger = inject<Ref<boolean>>("filePickerTrigger");

const onChange = () => {
  emit("change", filePicker.value?.files);
};

const dragOver = (e: DragEvent) => {
  draggingOver.value = true;
  e.preventDefault();
};

const dragLeave = (e: DragEvent) => {
  draggingOver.value = false;
  e.preventDefault();
};

const drop = (e: DragEvent) => {
  e.preventDefault();
  draggingOver.value = false;

  if (e.dataTransfer && filePicker.value) {
    if (
      ![...e.dataTransfer.files]
        .map((f) => getFileExtension(f.name).toLowerCase())
        .every((ext) => Object.keys(MIME_TYPES).includes(ext))
    ) {
      createToast("File extension not allowed");
      return;
    }

    if ([...e.dataTransfer.files].length > 5) {
      createToast("Max 5 files");
      return;
    }

    // Under 2MB
    if ([...e.dataTransfer.files].some((f) => f.size >= 3145728)) {
      createToast("Upload size reached");
      return;
    }

    filePicker.value.files = e.dataTransfer.files;
  }

  onChange();
};

watch(
  () => filePickerTrigger?.value,
  () => filePicker.value?.click()
);
</script>

<style scoped>
.overlay-container {
  display: contents;
  position: relative;
}

.pointer-events-none {
  pointer-events: none;
}
</style>
