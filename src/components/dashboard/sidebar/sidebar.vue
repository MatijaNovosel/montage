<template>
  <div class="border-r border-slate-700 flex">
    <div
      class="w-3/12 border-r border-slate-700 text-center h-full items-center justify-center flex flex-col"
    >
      <div
        v-for="({ name, image, value }, i) in TAB_ITEMS"
        :key="i"
        class="tab flex flex-col items-center mt-1 hover:bg-slate-800 cursor-pointer p-3 rounded-md select-none"
        :class="activeTab === value ? 'text-white' : 'text-slate-400'"
        @click="dashboardStore.setActiveTab(value)"
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
    <div class="w-9/12 text-center flex flex-col asset-ctr">
      <div class="shadow-xl py-5 flex flex-col bg-slate-900">
        <div class="text-slate-500 tracking-widest">
          {{ TAB_ITEMS[activeTab].name.toUpperCase() }}
        </div>
        <div class="mt-3 px-4">
          <text-input placeholder="Search" dense />
        </div>
      </div>
      <div class="overflow-auto px-8">
        <keep-alive>
          <component :is="activeTabComponent" />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDashboardStore } from "@/store/dashboard";
import { TAB_ITEMS } from "@/utils/constants";
import { storeToRefs } from "pinia";

const dashboardStore = useDashboardStore();
const { activeTab, activeTabComponent } = storeToRefs(dashboardStore);
</script>

<style scoped>
.asset-ctr {
  background-color: #0b111f;
}
</style>
