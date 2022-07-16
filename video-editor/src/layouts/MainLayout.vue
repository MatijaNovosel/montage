<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-dark">
        <div class="q-ml-sm row">
          <div
            class="cursor-pointer q-mr-md"
            v-for="(action, i) in actions"
            :key="i"
            @click="action.onClick && action.onClick()"
          >
            {{ action.text }}
            <SubAction :actions="action.subActions || []" />
          </div>
        </div>
        <q-space />
        <span class="q-mx-sm text-bold"> Untitled project </span>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Action } from "src/models/global";
import { defineComponent } from "vue";
import SubAction from "src/components/global/SubAction.vue";

export default defineComponent({
  name: "MainLayout",
  components: { SubAction },
  setup() {
    const actions: Action[] = [
      {
        text: "File",
        subActions: [
          {
            text: "New project",
            actions: [
              {
                text: "Sublabel",
                actions: [{ text: "Sublabel #1" }, { text: "Sublabel #2" }]
              }
            ]
          },
          {
            text: "Close project"
          }
        ]
      },
      {
        text: "Edit"
      },
      {
        text: "View"
      },
      {
        text: "Window"
      },
      {
        text: "Help"
      }
    ];
    return {
      actions
    };
  }
});
</script>
