<template>
  <div class="flex items-center h-full">
    <div class="flex flex-col items-center justify-center mx-auto">
      <h1 class="font-bold text-center text-2xl mb-3 text-white">Montage</h1>
      <div
        class="bg-zinc-800 rounded-lg p-5 flex flex-col items-center justify-center w-full"
      >
        <label class="font-semibold text-sm text-white pb-1 block self-start">
          E-mail
        </label>
        <input
          type="text"
          class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
        />
        <label class="font-semibold text-sm text-white pb-1 block self-start">
          Password
        </label>
        <input
          type="text"
          class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
        />
        <v-btn text="Sign in" />
      </div>
      <router-link :to="{ name: ROUTE_NAMES.DASHBOARD }">
        <v-btn class="mt-5" text="Go to Dashboard" />
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import ROUTE_NAMES from "@/router/routeNames";
</script>
