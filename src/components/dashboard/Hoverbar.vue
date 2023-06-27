<template>
  <div
    id="seek-hover"
    :style="{
      opacity,
      left: `${offset}px`
    }"
  />
</template>

<script lang="ts" setup>
defineProps<{
  opacity: number;
  offset: number;
}>();
</script>

<style lang="scss" scoped>
#seek-hover {
  height: 100%;
  background-color: #fff;
  width: 3px;
  opacity: 0.3;
  pointer-events: none;
  top: 0px;
  z-index: 99999999;
  position: absolute;
  border-radius: 5px;
}
</style>
