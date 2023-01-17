<template>
  <div class="text-sm text-slate-500 mt-5 mb-3">Emojis</div>
  <div class="flex flex-wrap gap-3 justify-center">
    <div
      v-for="(emoji, i) in EMOJIS"
      :key="i"
      class="bg-slate-700 rounded-md p-2 cursor-pointer hover:bg-slate-800 select-none grid-item flex justify-center"
      @click="
        emit({
          type: ASSET_TYPE.EMOJI,
          value: emoji
        })
      "
    >
      <img class="h-full" :src="`/emojis/${emoji}.svg`" />
    </div>
  </div>
  <div class="text-sm text-slate-500 mt-5 mb-3">Shapes</div>
  <div class="flex flex-wrap gap-3 pb-5 justify-center">
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
import { AssetEvent } from "@/models/common";
import { ASSET_TYPE, EMOJIS, SHAPES } from "@/utils/constants";
import { useEventBus } from "@vueuse/core";

const { emit } = useEventBus<AssetEvent>("asset");
</script>

<style scoped>
.grid-item {
  height: 50px;
  width: 50px;
}
</style>
