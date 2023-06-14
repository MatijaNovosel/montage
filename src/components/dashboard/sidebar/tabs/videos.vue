<template>
  <div class="text-sm text-zinc-500 my-5">Memes</div>
  <v-list density="compact" nav class="rounded-lg">
    <v-list-item
      v-for="(video, i) of VIDEOS"
      :key="i"
      @click="
        emit({
          type: LAYER_TYPE.VIDEO,
          value: video
        })
      "
    >
      <template #prepend>
        <div
          class="grid-item rounded-md my-1"
          :style="{
            backgroundImage: `url(/thumbnails/${video}.jpg)`,
            backgroundSize: 'cover'
          }"
        />
      </template>
      <v-list-item-title>
        {{ video }}
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script lang="ts" setup>
import { AssetEvent } from "@/models/common";
import { LAYER_TYPE, VIDEOS } from "@/utils/constants";
import { useEventBus } from "@vueuse/core";

const { emit } = useEventBus<AssetEvent>("asset");
</script>

<style scoped>
.grid-item {
  height: 45px;
  width: 45px;
}
</style>
