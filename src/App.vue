<template>
  <v-overlay
    v-model="loading"
    contained
    persistent
    z-index="2000"
    class="flex flex-col justify-center items-center text-center"
  >
    <div class="px-10 pt-10 pb-5 bg-zinc-800 rounded-xl">
      <v-progress-circular
        color="blue"
        indeterminate
        size="100"
        width="8"
        class="text-h4"
      >
        <span
          :style="{
            animation: 'pulse 2s infinite'
          }"
        >
          🎥
        </span>
      </v-progress-circular>
      <h1 class="mt-4">Video is rendering, hold tight!</h1>
    </div>
  </v-overlay>
  <div class="bg-zinc-900 w-screen h-screen">
    <router-view />
  </div>
  <toasts />
</template>

<script lang="ts" setup>
import Toasts from "@/components/app/toasts.vue";
import { storeToRefs } from "pinia";
import { useDashboardStore } from "./store/dashboard";

const dashboardStore = useDashboardStore();
const { loading } = storeToRefs(dashboardStore);
</script>
