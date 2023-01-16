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
    <div class="w-9/12 text-center flex flex-col">
      <div class="shadow-xl bg-slate-800 py-3">
        {{ TAB_ITEMS[activeTab].name }}
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
import { storeToRefs } from "pinia";
import { useDashboardStore } from "../../../store/dashboard";
import { TAB_ITEMS } from "../../../utils/constants";

const dashboardStore = useDashboardStore();
const { activeTab, activeTabComponent } = storeToRefs(dashboardStore);
</script>
