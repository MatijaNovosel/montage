<template>
  <h1 class="py-5">Text</h1>
  <btn
    @click="
      emit({
        type: ASSET_TYPE.TEXT,
        value: 'roboto'
      })
    "
  >
    Add text
  </btn>
</template>

<script lang="ts" setup>
import { useEventBus } from "@vueuse/core";
import { AssetEvent } from "../../../../models/common";
import { ASSET_TYPE } from "../../../../utils/constants";

const { emit } = useEventBus<AssetEvent>("asset");
</script>
