<template>
  <div class="border-r border-zinc-700 flex">
    <div
      class="w-3/12 border-r border-zinc-700 text-center h-full items-center justify-center flex flex-col gap-4 overflow-auto"
    >
      <v-btn
        v-for="({ name, icon, value }, i) in TAB_ITEMS"
        :key="i"
        @click="dashboardStore.setActiveTab(value)"
        v-tooltip="name"
        :icon="`mdi-${icon}`"
        variant="text"
        :color="activeTab === value ? 'orange' : 'white'"
      />
    </div>
    <div class="w-9/12 text-center flex flex-col bg-zinc-950">
      <div class="shadow-xl py-5 flex flex-col bg-zinc-900">
        <div class="text-zinc-500 tracking-widest">
          {{ TAB_ITEMS[activeTab].name.toUpperCase() }}
        </div>
        <div class="mt-3 px-4">
          <v-text-field
            hide-details
            density="compact"
            placeholder="Search"
            variant="solo"
            dense
            clearable
          />
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
