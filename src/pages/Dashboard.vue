<template>
  <h1 class="text-center text-3xl text-white mb-4">Dashboard</h1>
  <div class="grid grid-cols-12">
    <div class="col-span-4">
      <div class="bg-slate-800 rounded-lg p-5 ring-1 ring-slate-900/5 mb-5">
        <h3 class="text-white text-base font-medium tracking-tight">
          Writes Upside-Down
        </h3>
        <p class="text-slate-400 mt-2 text-sm">
          The Zero Gravity Pen can be used to write in any orientation,
          including upside-down. It even works in outer space.
        </p>
        <RouterLink :to="{ name: ROUTE_NAMES.AUTH }">
          <custom-button class="mt-5" text="Go to auth" />
        </RouterLink>
      </div>
      <div class="p-5 bg-slate-800 rounded-lg">
        <Greet />
      </div>
    </div>
    <div class="col-span-8 pl-5 h-full">
      <upload-overlay @change="filesUploaded">
        <div class="bg-slate-800 p-5 rounded-lg text-white">
          {{ $t("dropFileHere") }}
        </div>
      </upload-overlay>
    </div>
  </div>
</template>

<script setup lang="ts">
import Greet from "../components/Greet.vue";
import CustomButton from "../components/CustomButton.vue";
import ROUTE_NAMES from "../router/routeNames";
import UploadOverlay from "../components/UploadOverlay.vue";
import { provide, ref } from "vue";

const filePickerTrigger = ref(false);
provide("filePickerTrigger", filePickerTrigger);

const filesUploaded = (files: FileList) => {
  console.log(files);
};
</script>
