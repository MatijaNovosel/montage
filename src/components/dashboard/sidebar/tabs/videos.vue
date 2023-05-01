<template>
  <div class="text-sm text-slate-500 my-5">Memes</div>
  <div class="flex gap-4 justify-center items-center flex-wrap">
    <div
      v-for="(video, i) of VIDEOS"
      :key="i"
      v-tooltip="video"
      class="cursor-pointer grid-item rounded-md"
      @click="
        emit({
          type: LAYER_TYPE.VIDEO,
          value: video
        })
      "
      :style="{
        backgroundImage: `url(/thumbnails/${video}.jpg)`,
        backgroundSize: 'cover'
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { AssetEvent } from "@/models/common";
import { LAYER_TYPE, VIDEOS } from "@/utils/constants";
import { useEventBus } from "@vueuse/core";

const { emit } = useEventBus<AssetEvent>("asset");
</script>

<style scoped>
.grid-item {
  height: 75px;
  width: 75px;
}
</style>
