<template>
  <div class="overlay-container" @dragover="dragover" @drop="drop">
    <div
      class="full-width overlay-indicator"
      v-show="state.draggingOver"
      @dragleave="dragleave"
    >
      <h2 class="pointer-events-none text-grey text-h6">
        {{ $t("dragFileHere") }}
      </h2>
    </div>
    <input type="file" multiple hidden @change="onChange" ref="filePicker" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, inject, Ref } from "vue";
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

const state = reactive({
  filelist: [],
  draggingOver: false,
  allowedExtensions: computed(() => {
    const extensions = [];
    for (const extension in MIME_TYPES) {
      extensions.push(extension);
    }
    return extensions;
  })
});

const onChange = () => {
  emit("change", filePicker.value?.files);
};

const dragover = (e: DragEvent) => {
  state.draggingOver = true;
  e.preventDefault();
};

const dragleave = (e: DragEvent) => {
  state.draggingOver = false;
  e.preventDefault();
};

const drop = (e: DragEvent) => {
  e.preventDefault();
  state.draggingOver = false;

  if (e.dataTransfer && filePicker.value) {
    if (
      ![...e.dataTransfer.files]
        .map((f) => getFileExtension(f.name).toLowerCase())
        .every((ext) => state.allowedExtensions.includes(ext))
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
  height: calc(100% - 56px);
  top: 56px;
}
.pointer-events-none {
  pointer-events: none;
}
</style>
