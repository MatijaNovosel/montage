<template>
  <div class="flex flex-col justify-center py-5">
    <div class="flex flex-col justify-center mt-2 mb-6">
      <v-btn @click="open" color="green"> 📁 Add files </v-btn>
      <div class="mt-5">No files found, try adding some.</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AssetEvent } from "@/models/common";
import { useToastStore } from "@/store/toast";
import { FILE_SIZE_LIMIT, LAYER_TYPE } from "@/utils/constants";
import { useEventBus, useFileDialog } from "@vueuse/core";
import { watch } from "vue";
// @ts-ignore-line
import colors from "vuetify/lib/util/colors";

const { emit } = useEventBus<AssetEvent>("asset");
const { createToast } = useToastStore();

const { files, open, reset } = useFileDialog({
  multiple: false,
  accept: "image/png, image/jpeg, video/mp4"
});

watch(files, (val) => {
  if (val) {
    const file = val[0];
    try {
      if (file.size > FILE_SIZE_LIMIT) {
        throw new Error("File is too big!");
      }
      emit({
        type: LAYER_TYPE.UPLOAD,
        value: "upload",
        file
      });
    } catch (e: any) {
      createToast(e, colors.red.darken1);
    } finally {
      reset();
    }
  }
});
</script>
