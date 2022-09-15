<template>
  <h1 class="text-center text-3xl text-white mb-4">Dashboard</h1>
  <div class="bg-slate-800 rounded-lg p-5 ring-1 ring-slate-900/5 shadow-xl mb-5">
    <h3 class="text-white text-base font-medium tracking-tight">Writes Upside-Down</h3>
    <p class="text-slate-400 mt-2 text-sm">
      The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even
      works in outer space.
    </p>
    <RouterLink :to="{ name: ROUTE_NAMES.AUTH }">
      <button
        class="transition duration-200 mt-4 px-5 py-3 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-200 focus:outline-none focus:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-4 h-4 inline-block align-text-top"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span class="inline-block ml-1"> Go to auth </span>
      </button>
    </RouterLink>
  </div>
  <div class="p-5 bg-slate-800 rounded-lg">
    <Greet />
  </div>
</template>

<script setup lang="ts">
import Greet from "../components/Greet.vue";
import ROUTE_NAMES from "../router/routeNames";
</script>
