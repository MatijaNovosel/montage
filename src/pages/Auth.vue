<template>
  <div class="flex items-center h-full">
    <div class="flex flex-col items-center justify-center mx-auto">
      <h1 class="font-bold text-center text-2xl mb-3 text-white">
        Video editor
      </h1>
      <div
        class="bg-slate-800 rounded-lg p-5 flex flex-col items-center justify-center w-full"
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
        <custom-button text="Sign in" />
      </div>
      <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }">
        <custom-button class="mt-5" text="Go to Dashboard" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import ROUTE_NAMES from "../router/routeNames";
import CustomButton from "../components/CustomButton.vue";
</script>
