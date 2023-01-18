<template>
  <div class="flex flex-col justify-center py-5">
    <btn @click="open" background-color="#4BB543"> Add files </btn>
    <btn class="my-4" @click="reset" background-color="#FF0043">
      Clear files
    </btn>
    <div class="flex flex-col">
      <div v-if="files">
        {{ [...files].map((f) => f.name) }}
      </div>
      <div class="text-slate-500" v-else>No files uploaded.</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFileDialog } from "@vueuse/core";

const { files, open, reset } = useFileDialog();
</script>
