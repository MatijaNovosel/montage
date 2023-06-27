<template>
  <div
    id="video-duration-end-bar"
    :style="{
      left: `${offset}px`
    }"
  />
</template>

<script lang="ts" setup>
defineProps<{
  offset: number;
}>();
</script>

<style lang="scss" scoped>
#video-duration-end-bar {
  height: calc(100% - 50px);
  background-color: #7c6d94;
  width: 3px;
  opacity: 0.7;
  pointer-events: none;
  top: 50px;
  z-index: 5;
  position: absolute;
  border-radius: 5px;
}
</style>
