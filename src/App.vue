<template>
  <div class="bg-slate-900 w-screen h-screen">
    <router-view />
  </div>
  <toasts />
</template>

<script lang="ts" setup>
import Toasts from "../src/components/app/toasts.vue";
</script>
