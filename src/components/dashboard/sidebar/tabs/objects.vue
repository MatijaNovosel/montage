<template>
  <div class="text-sm text-slate-500 mt-5 mb-3">Emojis</div>
  <div class="flex flex-wrap gap-3 justify-center">
    <div
      v-for="(emoji, i) in EMOJIS"
      :key="i"
      class="bg-slate-700 rounded-md p-2 cursor-pointer hover:bg-slate-800 select-none grid-item flex justify-center"
      @click="dashboardStore.addObject(emoji)"
    >
      <img class="h-full" :src="`/emojis/${emoji}.png`" />
    </div>
  </div>
  <div class="text-sm text-slate-500 mt-5 mb-3">Shapes</div>
  <div class="flex flex-wrap gap-3 pb-5">
    <div
      v-for="(shape, i) in SHAPES"
      :key="i"
      class="bg-slate-700 rounded-md p-2 cursor-pointer hover:bg-slate-800 select-none grid-item flex justify-center"
    >
      <img class="h-full" :src="`/shapes/${shape}.svg`" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDashboardStore } from "../../../../store/dashboard";
import { EMOJIS, SHAPES } from "../../../../utils/constants";

const dashboardStore = useDashboardStore();
</script>

<style scoped>
.grid-item {
  height: 50px;
  width: 50px;
}
</style>
