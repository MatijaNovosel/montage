<template>
  <q-page ref="page">
    <Splitpanes :style="splitPanesStyle" horizontal>
      <Pane>
        <Splitpanes>
          <Pane min-size="20">
            <q-tabs
              v-model="tab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="effects" label="Effects" />
              <q-tab name="transitions" label="Transitions" />
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="effects">
                <div class="text-h6">Effects</div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </q-tab-panel>
              <q-tab-panel name="transitions">
                <div class="text-h6">Transitions</div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </q-tab-panel>
            </q-tab-panels>
          </Pane>
          <Pane min-size="20" style="background-color: #64b5f6" class="q-pa-md"> Video preview here </Pane>
        </Splitpanes>
      </Pane>
      <Pane min-size="40">
        <Splitpanes>
          <Pane min-size="20" style="background-color: #e53935" class="q-pa-md"> 3 </Pane>
          <Pane min-size="20" style="background-color: #64b5f6" class="q-pa-md"> 4 </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { Splitpanes, Pane } from "splitpanes";
import { useElementSize } from "@vueuse/core";
import "splitpanes/dist/splitpanes.css";

export default defineComponent({
  name: "PageIndex",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { Splitpanes, Pane },
  setup() {
    const page = ref(null);

    const { height: pageHeight } = useElementSize(page);

    return {
      page,
      tab: ref("effects"),
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
  left: -5px;
  right: -5px;
  height: 100%;
}

.splitpanes--horizontal > .splitpanes__splitter:before {
  top: -5px;
  bottom: -5px;
  width: 100%;
}
</style>
