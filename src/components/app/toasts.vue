<template>
  <transition-group
    name="list"
    class="toast-container bottom-20 flex flex-col fixed text-white z-5 text-center text-sm items-center"
    tag="div"
  >
    <div
      class="px-6 py-2 rounded-lg w-fit-content"
      v-for="(t, i) in toasts"
      :key="t.id"
      :class="{
        'mb-4': i !== toasts.length - 1
      }"
      :style="{
        backgroundColor: t.color
      }"
    >
      {{ t.msg }}
    </div>
  </transition-group>
</template>

<script lang="ts" setup>
import { useToastStore } from "../../store/toast";
const { toasts } = useToastStore();
</script>

<style scoped>
.toast-container {
  left: 50%;
  transform: translateX(-50%);
}
</style>
