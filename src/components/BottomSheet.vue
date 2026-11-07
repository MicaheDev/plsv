<script setup>
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  class: {
    type: String,
    default: "",
  },

});

const isShowed = defineModel({ type: Boolean, default: false });
</script>
<template>
  <div
    :class="
      clsx('fixed z-50 w-150 h-min max-h-full max-lg:w-full rounded-xl max-lg:rounded-none duration-300 max-lg:rounded-t-xl overflow-hidden max-lg:h-svh inset-0 m-auto border-2 border-slate-300 bg-white flex flex-col transition-transform preload', {
        'max-lg:translate-y-0 scale-100 max-lg:scale-100': isShowed,
        'max-lg:translate-y-full scale-0 max-lg:scale-100': !isShowed,
      }, props.class)
    "
  >
    <header class="w-full flex justify-between items-center h-15 px-4 shrink-0 border-b-2 border-slate-200">
      <h4 class="font-black">{{ title }}</h4>
        <button class="w-10 h-10 inline-flex justify-center rounded-xl items-center cursor-pointer hover:bg-slate-200" @click="isShowed = false"><FontAwesomeIcon :icon="faXmark" class="text-xl" /></button>
    </header>
    <main class="w-full flex-1 overflow-y-auto h-full p-6">
        <slot></slot>
    </main>
  </div>

  <div :class="clsx('fixed backdrop-blur-xs inset-0 w-full h-full z-10 bg-black/50')" v-if="isShowed" @click="isShowed = false"></div>

</template>
