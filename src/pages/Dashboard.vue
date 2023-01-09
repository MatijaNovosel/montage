<template>
  <div class="w-full flex text-white" style="height: calc(100% - 60px)">
    <div class="w-4/12 border-r border-slate-700 flex">
      <div
        class="w-3/12 border-r border-slate-700 text-center h-full items-center justify-center flex flex-col"
      >
        <div
          v-for="({ name, image, value }, i) in TAB_ITEMS"
          :key="i"
          class="tab flex flex-col items-center mt-1 hover:bg-slate-800 cursor-pointer p-3 rounded-md select-none"
          :class="activeTab === value ? 'text-white' : 'text-slate-400'"
          @click="appStore.setActiveTab(value)"
        >
          <img
            width="20"
            :src="`/tabs/${image}${activeTab === value ? '-active' : ''}.svg`"
          />
          <span class="pt-1 text-sm">
            {{ name }}
          </span>
        </div>
      </div>
      <div class="w-9/12 text-center flex flex-col">
        <div class="shadow-xl py-5">
          {{ TAB_ITEMS[activeTab].name }}
        </div>
        <div class="overflow-auto px-8">
          <div class="grid grid-cols-12 gap-3 py-5">
            <div class="col-span-12 text-left">
              <span class="text-sm text-slate-500"> Emojis </span>
            </div>
            <div
              v-for="(emoji, i) in EMOJIS"
              :key="i"
              class="col-span-3 bg-slate-700 rounded-md p-2 cursor-pointer hover:bg-slate-800 select-none"
            >
              <img :src="`/emojis/${emoji}.png`" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="main w-8/12 p-5 h-full flex flex-col justify-center items-center"
    >
      <main>🤬 Canvas 😡 Goes 😵 Here</main>
    </div>
  </div>
  <div
    class="flex justify-between items-center bg-slate-800 text-white px-5"
    style="height: 60px"
  >
    <div>Range</div>
    <div class="flex">
      <img
        class="cursor-pointer"
        src="/timeline/ff.svg"
        style="transform: scaleX(-1)"
      />
      <img class="mx-5 cursor-pointer" src="/timeline/play.svg" />
      <img class="cursor-pointer" src="/timeline/ff.svg" />
    </div>
    <button class="px-4 bg-indigo-400 rounded-md py-1">Save</button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "../store/app";
import { useToastStore } from "../store/toast";
import { EMOJIS, TAB_ITEMS } from "../utils/constants";

const { createToast } = useToastStore();
const appStore = useAppStore();
const { activeTab } = storeToRefs(appStore);

createToast("👋 Welcome to the app!", "#4BB543");
</script>

<style scoped>
.tab {
  height: 60px;
  width: 60px;
}
</style>
