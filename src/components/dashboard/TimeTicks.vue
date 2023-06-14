<template>
  <div class="flex items-center py-3 relative border-y border-zinc-700">
    <!-- Full seconds -->
    <span
      class="text-white text-right select-none"
      :key="n"
      v-for="n in duration"
      :style="{
        width: '100px'
      }"
    >
      {{ n }}s
    </span>
    <!-- Half seconds -->
    <span
      class="text-white-400 select-none absolute"
      :key="n"
      v-for="n in duration * 2"
      :style="{
        left: `${50 * n - 5}px`,
        display: !(n % 2) ? 'none' : undefined
      }"
    >
      •
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  duration: number;
}>();
</script>
