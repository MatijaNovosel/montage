<template>
  <div class="overlay-container" @dragover="dragover" @drop="drop">
    <div
      class="w-full h-full bg-slate-700 absolute flex justify-center items-center z-50 overlay-indicator"
      v-show="draggingOver"
      @dragleave="dragleave"
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
import { computed, inject, Ref, ref, watch } from "vue";
import { POSITION, TYPE, useToast } from "vue-toastification";
import { MIME_TYPES } from "../utils/constants";
import { getFileExtension } from "../utils/helpers";

const draggingOver = ref(false);
const filePicker = ref<HTMLInputElement | null>(null);
const toast = useToast();
const emit = defineEmits(["change"]);

const filePickerTrigger = inject<Ref<boolean>>("filePickerTrigger");

const allowedExtensions = computed(() => {
  const extensions = [];
  for (const extension in MIME_TYPES) {
    extensions.push(extension);
  }
  return extensions;
});

const onChange = () => {
  emit("change", filePicker.value?.files);
};

const dragover = (e: DragEvent) => {
  draggingOver.value = true;
  e.preventDefault();
};

const dragleave = (e: DragEvent) => {
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
        .every((ext) => allowedExtensions.value.includes(ext))
    ) {
      toast("File extension not allowed", {
        position: POSITION.BOTTOM_CENTER,
        type: TYPE.ERROR
      });
      return;
    }

    if ([...e.dataTransfer.files].length > 5) {
      toast("Max 5 files", {
        position: POSITION.BOTTOM_CENTER,
        type: TYPE.ERROR
      });
      return;
    }

    // Under 2MB
    if ([...e.dataTransfer.files].some((f) => f.size >= 3145728)) {
      toast("Upload size reached", {
        position: POSITION.BOTTOM_CENTER,
        type: TYPE.ERROR
      });
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
