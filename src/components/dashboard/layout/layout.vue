<template>
  <div class="border-l border-slate-700 flex flex-col pt-5 items-center">
    <span> Layout settings </span>
    <m-select
      class="mt-4 w-full px-3"
      placeholder="Select"
      :options="options"
    />
    <m-text-input dense class="mt-3 w-full px-3" placeholder="Text" />
    <color-picker class="mt-3" />
  </div>
</template>

<script lang="ts" setup>
import { SelectItem } from "../../../models/common";
import colorPicker from "../../app/colorPicker.vue";
import mSelect from "../../app/mSelect.vue";
import mTextInput from "../../app/mTextInput.vue";

const options: SelectItem<number>[] = [
  {
    text: "A",
    value: 1
  },
  {
    text: "B",
    value: 2
  },
  {
    text: "C",
    value: 3
  },
  {
    text: "D",
    value: 4
  },
  {
    text: "E",
    value: 5
  }
];
</script>
