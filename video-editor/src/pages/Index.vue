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
          <Pane min-size="20" class="q-pa-md bg-blue"> Video preview here </Pane>
        </Splitpanes>
      </Pane>
      <Pane min-size="40">
        <Splitpanes>
          <Pane min-size="20" class="bg-red">
            <div ref="dropZoneRef" class="bg-red-9 full-height full-width q-pa-md">
              <div>Hovering: {{ isOverDropZone }}</div>
              <div class="row">
                <div
                  v-for="(file, i) in filesData"
                  :key="i"
                  class="bg-grey"
                  style="height: 20px; width: 20px"
                >
                  <p>Name: {{ file.name }}</p>
                  <p>Size: {{ file.size }}</p>
                  <p>Type: {{ file.type }}</p>
                  <p>Last modified: {{ file.lastModified }}</p>
                </div>
              </div>
            </div>
          </Pane>
          <Pane min-size="20" class="q-pa-md bg-amber"> 4 </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { Splitpanes, Pane } from "splitpanes";
import { useDropZone, useElementSize } from "@vueuse/core";
import "splitpanes/dist/splitpanes.css";

export default defineComponent({
  name: "PageIndex",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { Splitpanes, Pane },
  setup() {
    const page = ref(null);
    const dropZoneRef = ref<HTMLElement | null>(null);
    const filesData = ref<{ name: string; size: number; type: string; lastModified: number }[]>([]);
    const { height: pageHeight } = useElementSize(page);

    const onDrop = (files: File[] | null) => {
      filesData.value = [];
      if (files) {
        filesData.value = files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }));
      }
    };

    const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);

    return {
      page,
      tab: ref("effects"),
      isOverDropZone,
      filesData,
      dropZoneRef,
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
