<template>
  <v-overlay
    v-model="loading"
    contained
    persistent
    z-index="2000"
    class="flex flex-col justify-center items-center text-center"
  >
    <v-progress-circular indeterminate size="100" width="8" />
    <h1 class="mt-4">🎥 Video is rendering, hold tight! 🎥</h1>
  </v-overlay>
  <div class="bg-slate-900 w-screen h-screen">
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
