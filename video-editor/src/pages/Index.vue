<template>
  <q-page style="background-color: white" ref="page">
    <Splitpanes :style="splitPanesStyle">
      <Pane style="background-color: #7e57c2" min-size="20"> 1 </Pane>
      <Pane>
        <Splitpanes horizontal>
          <Pane style="background-color: #e53935">2</Pane>
          <Pane style="background-color: #64b5f6">3</Pane>
          <Pane style="background-color: #d4e157">4</Pane>
        </Splitpanes>
      </Pane>
      <Pane style="background-color: #ffd54f">5</Pane>
    </Splitpanes>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { useElementSize } from "@vueuse/core";

export default defineComponent({
  name: "PageIndex",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { Splitpanes, Pane },
  setup() {
    const page = ref(null);

    const { height: pageHeight } = useElementSize(page);

    return {
      page,
      splitPanesStyle: computed(() => {
        return {
          height: `${pageHeight.value}px`
        };
      })
    };
  }
});
</script>
