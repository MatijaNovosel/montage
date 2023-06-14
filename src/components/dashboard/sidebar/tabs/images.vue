<template>
  <div class="text-sm text-zinc-500 my-5">Stock photos</div>
  <div class="flex gap-4 justify-center items-center flex-wrap">
    <div
      v-for="(image, i) of IMAGES"
      :key="i"
      v-tooltip="image"
      class="cursor-pointer grid-item rounded-md"
      @click="
        emit({
          type: LAYER_TYPE.IMAGE,
          value: image
        })
      "
      :style="{
        backgroundImage: `url(/images/${image}.jpg)`,
        backgroundSize: 'cover'
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { AssetEvent } from "@/models/common";
import { IMAGES, LAYER_TYPE } from "@/utils/constants";
import { useEventBus } from "@vueuse/core";

const { emit } = useEventBus<AssetEvent>("asset");
</script>

<style scoped>
.grid-item {
  height: 75px;
  width: 75px;
}
</style>
