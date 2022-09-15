<template>
  <div class="flex flex-col justify-center">
    <div class="mx-auto md:w-full md:max-w-md">
      <h1 class="font-bold text-center text-2xl mb-5 text-white">Video editor</h1>
      <div class="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
        <div class="px-5 py-7">
          <label class="font-semibold text-sm text-gray-600 pb-1 block">E-mail</label>
          <input type="text" class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full" />
          <label class="font-semibold text-sm text-gray-600 pb-1 block">Password</label>
          <input type="text" class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full" />
          <button
            type="button"
            class="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
          >
            <span class="inline-block mr-2">Login</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-4 h-4 inline-block"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>
      <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }">
        <button
          class="mt-4 transition duration-200 p-5 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-200 focus:outline-none focus:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset"
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
          <span class="inline-block ml-1">Back to dashboard</span>
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import ROUTE_NAMES from "../router/routeNames";
</script>
