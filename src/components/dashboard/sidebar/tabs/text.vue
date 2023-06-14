<template>
  <div class="flex text-left flex-col gap-y-3 py-5">
    <div class="text-zinc-500">Basic text</div>
    <v-btn
      id="heading-text"
      @click="
        emit({
          type: LAYER_TYPE.TEXT,
          value: 'heading'
        })
      "
    >
      Add heading
    </v-btn>
    <v-btn
      id="subheading-text"
      @click="
        emit({
          type: LAYER_TYPE.TEXT,
          value: 'subheading'
        })
      "
    >
      Add subheading
    </v-btn>
    <v-btn
      id="body-text"
      @click="
        emit({
          type: LAYER_TYPE.TEXT,
          value: 'body'
        })
      "
    >
      Add body text
    </v-btn>
    <div class="text-zinc-500">Sans Serif</div>
    <v-btn
      v-for="f in TEXT_ITEMS.sansSerif"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: `${f}, sans-serif`
      }"
      @click="
        emit({
          type: LAYER_TYPE.TEXT,
          value: f
        })
      "
    >
      {{ f }}
    </v-btn>
    <div class="text-zinc-500">Serif</div>
    <v-btn
      v-for="f in TEXT_ITEMS.serif"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: f
      }"
      @click="
        emit({
          type: LAYER_TYPE.TEXT,
          value: f
        })
      "
    >
      {{ f }}
    </v-btn>
    <div class="text-zinc-500">Monospace</div>
    <v-btn
      v-for="f in TEXT_ITEMS.monospace"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: f
      }"
      @click="
        emit({
          type: LAYER_TYPE.TEXT,
          value: f
        })
      "
    >
      {{ f }}
    </v-btn>
    <div class="text-zinc-500">Handwriting</div>
    <v-btn
      v-for="f in TEXT_ITEMS.handwriting"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: f
      }"
      @click="
        emit({
          type: LAYER_TYPE.TEXT,
          value: f
        })
      "
    >
      {{ f }}
    </v-btn>
    <div class="text-zinc-500">Display</div>
    <v-btn
      v-for="f in TEXT_ITEMS.display"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: f
      }"
      @click="
        emit({
          type: LAYER_TYPE.TEXT,
          value: f
        })
      "
    >
      {{ f }}
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { AssetEvent } from "@/models/common";
import { LAYER_TYPE } from "@/utils/constants";
import { useEventBus } from "@vueuse/core";
import { onMounted } from "vue";
import WebFont from "webfontloader";

const { emit } = useEventBus<AssetEvent>("asset");

const TEXT_ITEMS: Record<string, string[]> = {
  sansSerif: ["Roboto", "Montserrat", "Poppins"],
  serif: ["Playfair Display", "Merriweather", "IBM Plex Serif"],
  monospace: ["Roboto Mono", "Inconsolata", "Source Code Pro"],
  handwriting: ["Dancing Script", "Pacifico", "Indie Flower"],
  display: ["Lobster", "Bebas Neue", "Titan One"]
};

onMounted(() => {
  Object.keys(TEXT_ITEMS).forEach((type) => {
    const fonts = TEXT_ITEMS[type];
    WebFont.load({
      google: {
        families: fonts
      }
    });
  });
});
</script>

<style scoped>
#heading-text {
  font-size: 22px;
  font-weight: 700;
  height: 44px;
  line-height: 44px;
  font-family: Roboto;
}

#subheading-text {
  font-size: 16px;
  font-weight: 500;
  height: 34px;
  line-height: 34px;
  font-family: Roboto;
}

#body-text {
  font-size: 12px;
  font-weight: 400;
  height: 28px;
  line-height: 28px;
  font-family: Roboto;
}

#item-text {
  font-size: 16px;
  font-weight: 500;
  height: 34px;
  line-height: 34px;
}
</style>
