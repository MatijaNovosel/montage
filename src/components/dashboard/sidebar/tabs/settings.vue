<template>
  <div class="text-sm text-zinc-500 my-5">General</div>
  <div class="flex flex-col justify-center items-center gap-y-3 w-full">
    <v-select
      class="w-full"
      density="compact"
      hide-details
      label="Language"
      :items="Object.values(LANGUAGES)"
      v-model="state.language"
    />
    <v-switch density="compact" hide-details label="Autosave" />
  </div>
</template>

<script lang="ts" setup>
import { LANGUAGES } from "@/utils/constants";
import { reactive } from "vue";

const state = reactive({
  language: LANGUAGES.CROATIAN
});
</script>
