<template>
  <div class="flex flex-col justify-center py-5">
    <div class="flex flex-col justify-center mt-2 mb-6">
      <v-btn @click="open" background-color="#4BB543"> 📁 Add files </v-btn>
      <div class="mt-5">No files found, try adding some.</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AssetEvent } from "@/models/common";
import { ASSET_TYPE } from "@/utils/constants";
import { useEventBus, useFileDialog } from "@vueuse/core";
import { watch } from "vue";

const { emit } = useEventBus<AssetEvent>("asset");

const { files, open, reset } = useFileDialog({
  multiple: false,
  accept: "image/png, image/jpeg"
});

watch(files, (val) => {
  if (val) {
    const file = val[0];
    emit({
      type: ASSET_TYPE.UPLOAD,
      value: "upload",
      file
    });
    reset();
  }
});
</script>
