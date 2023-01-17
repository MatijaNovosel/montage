<template>
  <div class="flex w-full">
    <floating-vue-dropdown
      ref="popoverRef"
      :distance="5"
      :triggers="['click']"
      theme="dropdown-menu"
      :placement="placement"
      auto-hide
      auto-size
      :prevent-overflow="false"
      auto-boundary-max-size
      :flip="false"
      class="w-full"
      @hide="onHide"
    >
      <button
        class="pl-3 py-1 rounded-l-lg hover:bg-slate-700 transition duration-150 ease-in-out w-full text-left no-highlight text-sm"
        :class="{
          [`bg-${backgroundColor}`]: true
        }"
      >
        <div class="flex flex-wrap" v-if="selectedItem !== null">
          {{ selectedItem.text }}
        </div>
        <span class="text-slate-400" v-else> {{ placeholder }} </span>
      </button>
      <template #popper>
        <ul class="py-1 bg-slate-600 text-white rounded">
          <li
            v-for="option in options"
            :key="option.value"
            class="py-1 px-2 hover:bg-slate-700 cursor-pointer text-sm"
            @click="selectItem(option)"
          >
            {{ option.text }}
          </li>
        </ul>
      </template>
    </floating-vue-dropdown>
    <div
      class="bg-slate-700 icon flex justify-center items-center rounded-r-lg px-3 hover:bg-slate-600 cursor-pointer"
    >
      <img height="30" width="30" src="/close.svg" @click="clear" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SelectItem } from "@/models/common";
import { Dropdown as FloatingVueDropdown } from "floating-vue";
import { PropType, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Object as PropType<SelectItem<number> | null>,
    default: null
  },
  placeholder: {
    type: String,
    default: "Placeholder"
  },
  placement: {
    type: String,
    default: "bottom-start"
  },
  backgroundColor: {
    type: String,
    default: "slate-800"
  },
  options: { type: Array as PropType<SelectItem<number>[]>, default: [] }
});

const popoverRef = ref(null);
const selectedItem = ref<SelectItem<number> | null>(props.modelValue);

const onHide = () => {
  (popoverRef.value as any).$refs.popper.$_targetNodes[0].focus();
};

const clear = () => {
  selectItem(null);
};

const emit = defineEmits(["update:modelValue", "on-selected"]);

const selectItem = (item: SelectItem<number> | null) => {
  selectedItem.value = item;
  (popoverRef.value as any).$refs.popper.hide();
  emit("update:modelValue", selectedItem.value);
  emit("on-selected");
};
</script>

<style>
.v-popper--theme-dropdown-menu .v-popper__arrow-container {
  display: none;
}
</style>
