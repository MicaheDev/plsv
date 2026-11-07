<script setup lang="ts">
import { faHammer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <div class="w-full min-h-full p-6 flex flex-col gap-6 max-w-2xl mx-auto">
    <h1 class="font-black uppercase text-2xl text-center">En Contrucción</h1>
    <FontAwesomeIcon :icon="faHammer" class="text-8xl mx-auto text-gray-500" />
  </div>
</template>
