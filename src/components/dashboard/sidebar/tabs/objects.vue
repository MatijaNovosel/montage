<template>
  <div class="grid grid-cols-12 gap-2 pt-5">
    <div class="col-span-12 text-left">
      <span class="text-sm text-slate-500"> Emojis </span>
    </div>
    <div
      v-for="(emoji, i) in EMOJIS"
      :key="i"
      class="col-span-4 bg-slate-700 rounded-md p-2 cursor-pointer hover:bg-slate-800 select-none"
    >
      <img :src="`/emojis/${emoji}.png`" />
    </div>
  </div>
  <div class="grid grid-cols-12 gap-3 py-5">
    <div class="col-span-12 text-left">
      <span class="text-sm text-slate-500"> Shapes </span>
    </div>
    <div
      v-for="(shape, i) in SHAPES"
      :key="i"
      class="col-span-4 bg-slate-700 rounded-md p-2 cursor-pointer hover:bg-slate-800 select-none flex justify-center items-center"
    >
      <img :src="`/shapes/${shape}.svg`" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { EMOJIS, SHAPES } from "../../../../utils/constants";
</script>
