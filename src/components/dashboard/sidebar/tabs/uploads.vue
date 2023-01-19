<template>
  <div class="flex flex-col justify-center py-5">
    <div class="flex justify-center mt-2 mb-6">
      <btn @click="open" background-color="#4BB543"> Add files </btn>
      <btn class="ml-4" @click="reset" background-color="#FF0043">
        Clear files
      </btn>
    </div>
    <div class="flex flex-col">
      <div v-if="files">
        {{ [...files].map((f) => f.name) }}
      </div>
      <div class="text-slate-500" v-else>No files uploaded.</div>
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
  }
});
</script>
