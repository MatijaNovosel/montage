<template>
  <div class="overlay-container" @dragover="dragover" @drop="drop">
    <div class="overlay-indicator" v-show="draggingOver" @dragleave="dragleave">
      <h2 class="pointer-events-none text-white text-xl">
        {{ $t("dragFileHere") }}
      </h2>
    </div>
    <input type="file" multiple hidden @change="onChange" ref="filePicker" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, Ref } from "vue";
import { MIME_TYPES } from "../utils/constants";
import { getFileExtension } from "../utils/helpers";
import { useI18n } from "vue-i18n";
import { POSITION, TYPE, useToast } from "vue-toastification";

const emit = defineEmits(["change"]);
const filePicker = ref<HTMLInputElement | null>(null);
const { t } = useI18n();
const toast = useToast();

// Plugins
const filePickerTrigger = inject<Ref<boolean>>("filePickerTrigger");

const allowedExtensions = computed(() => {
  const extensions = [];
  for (const extension in MIME_TYPES) {
    extensions.push(extension);
  }
  return extensions;
});

const draggingOver = ref(false);

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
      toast(t("thatFileExtensionIsNotAllowed"), {
        position: POSITION.BOTTOM_CENTER,
        type: TYPE.ERROR
      });
      return;
    }

    if ([...e.dataTransfer.files].length > 5) {
      toast(t("max5Files"), {
        position: POSITION.BOTTOM_CENTER,
        type: TYPE.ERROR
      });
      return;
    }

    // Under 2MB
    if ([...e.dataTransfer.files].some((f) => f.size >= 3145728)) {
      toast(t("maxUploadSize"), {
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

<style lang="scss" scoped>
@import "../utils/variables";

.overlay-container {
  display: contents;
}

.overlay-indicator {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  background-color: $bg-dark-1;
  top: 56px;
}

.pointer-events-none {
  pointer-events: none;
}
</style>
