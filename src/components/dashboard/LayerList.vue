<template>
  <div
    class="flex flex-col h-full border-r border-slate-700 overflow-auto"
    :style="{ width: `${DRAWER_WIDTH}px` }"
  >
    <div
      class="flex items-center border-slate-700 border-y pl-4 py-3 text-slate-500 select-none tracking-widest"
    >
      LAYERS
    </div>
    <template v-if="layers.length">
      <div
        class="pl-4 cursor-pointer layer-item flex items-center border-b-2 border-slate-800"
        v-for="(layer, i) of layers"
        :class="{
          'bg-indigo-500 hover:bg-indigo-400': activeObjectId === layer.id,
          'bg-slate-800 hover:bg-slate-700':
            i % 2 && activeObjectId !== layer.id,
          'bg-slate-900 hover:bg-slate-800':
            !(i % 2) && activeObjectId !== layer.id
        }"
        :key="layer.id"
        @click="emit('set-active-obj', layer.id)"
      >
        <span class="mr-3">
          {{ LAYER_TYPE_ICON[layer.type] }}
        </span>
        <span class="bg-black px-2 py-1 rounded-md text-xs">
          {{ `${layer.type} ${layer.id}` }}
        </span>
      </div>
    </template>
    <div class="p-5" v-else>No layers added.</div>
  </div>
</template>

<script setup lang="ts">
import { Layer } from "@/models/common";
import { DRAWER_WIDTH, LAYER_TYPE_ICON } from "@/utils/constants";

const emit = defineEmits<{
  (e: "set-active-obj", layerId: string): void;
}>();

defineProps<{
  layers: Layer[];
  activeObjectId?: string | null;
}>();
</script>

<style scoped lang="scss">
.layer-item {
  min-height: 35px;
}
</style>
