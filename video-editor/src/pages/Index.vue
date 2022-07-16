<template>
  <q-page class="row">
    <div class="col-6 bg-green text-center">
      <h1>1</h1>
    </div>
    <div class="col-6 bg-red text-center items-center">
      <q-video :ratio="16 / 9" src="https://www.youtube.com/embed/k3_tw44QsZQ?rel=0" />
    </div>
    <div class="col-6 bg-yellow text-center">
      <h1>3</h1>
    </div>
    <div class="col-6 bg-blue text-center">
      <h1>4</h1>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PageIndex",
  setup() {
    return {};
  }
});
</script>
