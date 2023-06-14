<template>
  <div
    class="top-left flex flex-col select-none bg-black bg-opacity-50 p-2 rounded-lg"
  >
    <div>
      <span class="text-zinc-500 font-bold">🗑️ Used </span>
      {{ bytesToSize(memory?.usedJSHeapSize) }}
    </div>
    <div class="py-1">
      <span class="text-zinc-500 font-bold">📦 Allocated </span>
      {{ bytesToSize(memory?.totalJSHeapSize) }}
    </div>
    <div>
      <span class="text-zinc-500 font-bold">💾 Limit </span>
      {{ bytesToSize(memory?.jsHeapSizeLimit) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { bytesToSize } from "@/utils/helpers";
import { useMemory } from "@vueuse/core";

const { memory } = useMemory();
</script>
