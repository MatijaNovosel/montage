<template>
  <q-menu anchor="bottom right" self="top start" v-if="actions && actions.length !== 0">
    <q-list dense>
      <q-item v-for="(action, i) in actions" :key="`subAction_${i}`" clickable>
        <q-item-section>
          {{ action.text }}
        </q-item-section>
        <q-item-section side v-if="action.actions && action.actions.length !== 0">
          <q-icon name="keyboard_arrow_right" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import { SubAction } from "src/models/global";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "SubAction",
  props: {
    actions: {
      type: Object as PropType<SubAction[]>,
      required: true
    }
  },
  setup() {
    return {};
  }
});
</script>
