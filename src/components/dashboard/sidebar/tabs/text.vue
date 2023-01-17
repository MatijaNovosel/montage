<template>
  <div class="flex text-left flex-col gap-y-3 py-5">
    <div class="text-slate-500">Basic text</div>
    <btn
      id="heading-text"
      @click="
        emit({
          type: ASSET_TYPE.TEXT,
          value: 'heading'
        })
      "
    >
      Add heading
    </btn>
    <btn
      id="subheading-text"
      @click="
        emit({
          type: ASSET_TYPE.TEXT,
          value: 'subheading'
        })
      "
    >
      Add subheading
    </btn>
    <btn
      id="body-text"
      @click="
        emit({
          type: ASSET_TYPE.TEXT,
          value: 'body'
        })
      "
    >
      Add body text
    </btn>
    <div class="text-slate-500">Sans Serif</div>
    <btn
      v-for="f in TEXT_ITEMS.sansSerif"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: `${f}, sans-serif`
      }"
      @click="
        emit({
          type: ASSET_TYPE.TEXT,
          value: 'heading'
        })
      "
    >
      {{ f }}
    </btn>
    <div class="text-slate-500">Serif</div>
    <btn
      v-for="f in TEXT_ITEMS.serif"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: f
      }"
      @click="
        emit({
          type: ASSET_TYPE.TEXT,
          value: 'heading'
        })
      "
    >
      {{ f }}
    </btn>
    <div class="text-slate-500">Monospace</div>
    <btn
      v-for="f in TEXT_ITEMS.monospace"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: f
      }"
      @click="
        emit({
          type: ASSET_TYPE.TEXT,
          value: 'heading'
        })
      "
    >
      {{ f }}
    </btn>
    <div class="text-slate-500">Handwriting</div>
    <btn
      v-for="f in TEXT_ITEMS.handwriting"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: f
      }"
      @click="
        emit({
          type: ASSET_TYPE.TEXT,
          value: 'heading'
        })
      "
    >
      {{ f }}
    </btn>
    <div class="text-slate-500">Display</div>
    <btn
      v-for="f in TEXT_ITEMS.display"
      :key="f"
      id="item-text"
      :style="{
        fontFamily: f
      }"
      @click="
        emit({
          type: ASSET_TYPE.TEXT,
          value: 'heading'
        })
      "
    >
      {{ f }}
    </btn>
  </div>
</template>

<script lang="ts" setup>
import { useEventBus } from "@vueuse/core";
import { onMounted } from "vue";
import WebFont from "webfontloader";
import { AssetEvent } from "../../../../models/common";
import { ASSET_TYPE } from "../../../../utils/constants";

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
    fonts.forEach((font) => {
      WebFont.load({
        google: {
          families: [font]
        }
      });
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
}

#subheading-text {
  font-size: 16px;
  font-weight: 500;
  height: 34px;
  line-height: 34px;
}

#body-text {
  font-size: 12px;
  font-weight: 400;
  height: 28px;
  line-height: 28px;
}

#item-text {
  font-size: 16px;
  font-weight: 500;
  height: 34px;
  line-height: 34px;
}
</style>
