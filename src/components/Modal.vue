<script setup>
import clsx from "clsx";

const isShowed = defineModel({ type: Boolean, default: false });
</script>
<template>
  <div
    :class="
      clsx('fixed w-full h-full top-0 bg-white flex flex-col transition-transform', {
        'traslate-x-0': isShowed,
        '-translate-x-full': !isShowed,
      })
    "
  >
    <header class="w-full h-15 shrink-0 border-b-2 border-slate-300">
        <button @click="isShowed = false">x</button>
    </header>
    <main class="w-full h-full">
        <slot></slot>
    </main>
  </div>
</template>
