<template>
  <div class="text-sm text-slate-500 my-5">Stock photos</div>
  <div class="flex gap-4 justify-center items-center flex-wrap">
    <div
      v-for="(image, i) of IMAGES"
      :key="i"
      v-tooltip="image"
      class="cursor-pointer grid-item rounded-md"
      :style="{
        backgroundImage: `url(/images/${image}.jpg)`,
        backgroundSize: 'cover'
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { IMAGES } from "@/utils/constants";
</script>

<style scoped>
.grid-item {
  height: 75px;
  width: 75px;
}
</style>
