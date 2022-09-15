<template>
  <button
    class="bg-slate-600 transition duration-200 px-3 py-2 cursor-pointer font-normal text-sm rounded-lg text-white hover:bg-slate-400 focus:outline-none focus:bg-slate-400 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset"
  >
    {{ text }}
  </button>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: ""
  }
});
</script>
