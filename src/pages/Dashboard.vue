<template>
  <div
    class="w-full flex text-white"
    style="height: calc(100% - var(--timeline-height))"
  >
    <sidebar class="w-3/12" />
    <div
      class="main w-7/12 p-5 h-full flex flex-col justify-center items-center relative"
    >
      <button
        @click="undo"
        class="px-3 bg-slate-700 hover:bg-slate-600 rounded-md py-1 flex justify-center items-center undo-btn"
      >
        <img class="mr-2" src="/undo.svg" /> Undo
      </button>
      <button
        class="px-3 bg-slate-600 hover:bg-slate-500 rounded-md py-1 flex justify-center items-center redo-btn"
      >
        <img style="transform: scaleX(-1)" class="mr-2" src="/undo.svg" />
        Redo
      </button>
      <main>
        <Greet />
      </main>
    </div>
    <layout class="w-2/12" />
  </div>
  <div
    class="flex justify-between items-center bg-slate-800 text-white px-5"
    style="height: var(--timeline-height)"
  >
    <div>Range</div>
    <div class="flex">
      <img
        class="cursor-pointer"
        src="/timeline/ff.svg"
        style="transform: scaleX(-1)"
      />
      <img class="mx-5 cursor-pointer" src="/timeline/play.svg" />
      <img class="cursor-pointer" src="/timeline/ff.svg" />
    </div>
    <button class="px-4 bg-indigo-400 hover:bg-indigo-300 rounded-md py-1">
      Save
    </button>
  </div>
</template>

<script setup lang="ts">
import Layout from "../components/dashboard/layout/layout.vue";
import Sidebar from "../components/dashboard/sidebar/sidebar.vue";
import Greet from "../components/Greet.vue";
import { useToastStore } from "../store/toast";

const { createToast } = useToastStore();
createToast("✅ App successfully started!", "#4BB543");

const undo = () => {
  createToast("🚨 Undo", "#f80000");
};
</script>

<style scoped>
.undo-btn {
  position: absolute;
  top: 15px;
  left: 15px;
}

.redo-btn {
  position: absolute;
  top: 15px;
  left: 110px;
}
</style>
