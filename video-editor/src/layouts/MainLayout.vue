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
        <span class="q-mx-sm text-bold">
          {{ currentProjectTitle }}
        </span>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Action } from "src/models/global";
import { defineComponent, computed } from "vue";
import SubAction from "src/components/global/SubAction.vue";
import { useStore, Getters } from "src/store";
import { NotificationService } from "src/services/notification/notification";

export default defineComponent({
  name: "MainLayout",
  components: { SubAction },
  setup() {
    const store = useStore();
    const notificationService = new NotificationService();

    const actions: Action[] = [
      {
        text: "File",
        subActions: [
          {
            text: "New project",
            onClick: () => {
              notificationService.notify("New project has been created!");
            }
          },
          {
            text: "Close project"
          },
          {
            text: "Export"
          },
          {
            text: "Save"
          },
          {
            text: "Close"
          }
        ]
      },
      {
        text: "Edit",
        subActions: [
          {
            text: "Sublabel 1",
            actions: [
              {
                text: "Sublabel 2",
                actions: [{ text: "Sublabel #1" }, { text: "Sublabel #2" }]
              }
            ]
          }
        ]
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
      actions,
      currentProjectTitle: computed(() => {
        return (store.getters as Getters)["app/currentProjectTitle"];
      })
    };
  }
});
</script>
