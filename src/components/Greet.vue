<template>
  <div class="flex items-center justify-center text-black">
    <input
      v-model="name"
      placeholder="Enter a name..."
      class="border rounded-lg px-3 py-2 text-sm w-full"
    />
    <custom-button class="ml-3" text="Greet" @click="greet" />
  </div>
  <p class="text-white text-sm mt-5">{{ greetMsg }}</p>
</template>

<script setup lang="ts">
import { invoke } from "@tauri-apps/api/tauri";
import { ref } from "vue";
import CustomButton from "./CustomButton.vue";

const greetMsg = ref("");
const name = ref("");

const greet = async () => {
  if (name.value !== "") {
    greetMsg.value = await invoke("greet", { name: name.value });
  }
};
</script>
