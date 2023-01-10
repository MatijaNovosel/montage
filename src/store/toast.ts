import { randInt } from "matija-utils";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface Toast {
  id: number;
  msg: string;
  color: string;
  permanent: boolean;
}

const TOAST_LIMIT = 5;

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  const createToast = (
    msg: string,
    color = "#1f2f5f",
    timeout = 4000,
    permanent = false
  ) => {
    if (toasts.value.length + 1 > TOAST_LIMIT) return;
    const id = randInt(1, 9999);

    toasts.value.push({
      id,
      msg,
      color,
      permanent
    });

    if (!permanent) {
      setTimeout(() => {
        const toastIdx = toasts.value.findIndex((t) => t.id === id);
        if (toastIdx !== -1) toasts.value.splice(toastIdx, 1);
      }, timeout);
    }
  };

  const permanentToastExists = computed(() =>
    toasts.value.some((t) => t.permanent === true)
  );

  const removePermanentToasts = () => {
    const toastIdx = toasts.value.findIndex((t) => t.permanent === true);
    if (toastIdx !== -1) toasts.value.splice(toastIdx, 1);
  };

  return {
    toasts,
    createToast,
    removePermanentToasts,
    permanentToastExists
  };
});
