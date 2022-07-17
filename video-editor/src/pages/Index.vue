<template>
  <q-page style="background-color: white" ref="page">
    <Splitpanes :style="splitPanesStyle" horizontal>
      <Pane>
        <Splitpanes>
          <Pane min-size="20" style="background-color: #e53935">1</Pane>
          <Pane min-size="20" style="background-color: #64b5f6">2</Pane>
        </Splitpanes>
      </Pane>
      <Pane>
        <Splitpanes>
          <Pane min-size="20" style="background-color: #e53935">3</Pane>
          <Pane min-size="20" style="background-color: #64b5f6">4</Pane>
        </Splitpanes>
      </Pane>
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

<style>
.splitpanes__splitter {
  background-color: #ccc;
  position: relative;
}

.splitpanes__splitter:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: rgba(255, 0, 0, 0.3);
  opacity: 0;
  z-index: 1;
}

.splitpanes__splitter:hover:before {
  opacity: 1;
}

.splitpanes--vertical > .splitpanes__splitter:before {
  left: -30px;
  right: -30px;
  height: 100%;
}

.splitpanes--horizontal > .splitpanes__splitter:before {
  top: -30px;
  bottom: -30px;
  width: 100%;
}
</style>
