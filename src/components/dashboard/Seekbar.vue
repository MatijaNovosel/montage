<template>
  <div
    id="seekbar"
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
#seekbar {
  height: calc(100% - 36px);
  width: 2px;
  background-color: #fff;
  position: absolute;
  z-index: 99999999;
  pointer-events: all;
  top: 36px;
  &:hover {
    outline: 3px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
  }
  &:after {
    background: url(/seeker.svg);
    display: block;
    content: "";
    position: absolute;
    width: 13px;
    height: 18px;
    margin-left: -6px;
    z-index: 9;
    box-sizing: border-box;
  }
}
</style>
