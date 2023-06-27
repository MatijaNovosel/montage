<template>
  <div
    @mousemove="(e) => emit('follow-cursor', e)"
    @mouseleave="(e) => emit('hide-seekbar', e)"
    @click="(e) => emit('seek', e)"
    class="flex flex-col timeline-body"
    v-if="layers.length"
  >
    <div
      @mousedown.prevent="(e: MouseEvent) => emit('drag', e, layer)"
      class="main-row relative border-b-2 border-zinc-800"
      :class="{
        'border-y-2': i === 0,
        'border-b-2': i > 0
      }"
      v-for="(layer, i) of layers"
      :key="layer.id"
      :style="{
        width: calculateLayerWidth(layer),
        left: `${layer.offset}px`
      }"
    >
      <div class="row-element">
        <div
          :style="{
            width: `${layer.duration / 10 - layer.startTrim - layer.endTrim}px`,
            left: `${layer.startTrim}px`
          }"
          class="trim-row absolute"
          :class="{
            [`bg-${LAYER_TYPE_COLOR[layer.type]}`]: true
          }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Layer } from "@/models/common";
import { useDashboardStore } from "@/store/dashboard";
import { LAYER_TYPE_COLOR } from "@/utils/constants";
import { calculateLayerWidth } from "@/utils/helpers";
import { storeToRefs } from "pinia";

const emit = defineEmits<{
  (e: "follow-cursor", event: MouseEvent): void;
  (e: "hide-seekbar", event: MouseEvent): void;
  (e: "seek", event: MouseEvent): void;
  (e: "drag", event: MouseEvent, layer: Layer): void;
}>();

const dashboardStore = useDashboardStore();

const { layers } = storeToRefs(dashboardStore);
</script>

<style lang="scss">
.main-row {
  min-height: 35px;
}

.trim-row {
  height: 100%;
  width: 100%;
  &:before {
    width: 5px;
    position: absolute;
    display: block;
    content: "";
    height: 100%;
    z-index: 9999 !important;
  }
  &:after {
    width: 7px;
    position: absolute;
    right: 0px;
    height: 100%;
    content: "";
    z-index: 9999 !important;
  }
  &:hover:before {
    cursor: ew-resize;
  }
  &:hover:after {
    cursor: ew-resize;
  }
}

.row-element {
  position: absolute;
  height: 100%;
  width: 100%;
  &::before {
    background-color: #826868;
    opacity: 0.4;
    display: block;
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
  }
}

.timeline-body {
  height: 190px;
}
</style>
