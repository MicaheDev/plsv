<script setup>
import pb from "@/services/pb";
import { ref, onMounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faBookBookmark,
  faReply,
  faPencil,
  faRoute

} from "@fortawesome/free-solid-svg-icons";
import Select from "@/components/Select.vue";
const links = [
  {
    path: "/profile",
    icon: faReply,
    label: "Volver",
  },
  {
    path: "/studio/route",
    icon: faRoute,
    label: "Ruta",
  },
  {
    path: "/studio/dictionary",
    icon: faBookBookmark,
    label: "Diccionario",
  },

];

// Nivel seleccionado (A1 por defecto)
const selectedLevel = ref("a1");

const levelOptions = [
  { label: "Nivel A1", value: "a1" },
  { label: "Nivel A2", value: "a2" },
  { label: "Nivel B1", value: "b1" },
  { label: "Nivel B2", value: "b2" },
  { label: "Nivel C1", value: "c1" },
  { label: "Nivel C2", value: "c2" },
];

</script>

<template>
  <div class="w-full h-svh flex flex-row-reverse max-lg:flex-col">
     <div
      class="w-full h-full flex flex-row-reverse max-lg:flex-col justify-center overflow-hidden"
    >
   <slot/>
  
      
    </div>

    <nav
      class="flex flex-col gap-2 max-lg:flex-row w-75 border-r-2 border-slate-200 p-4 max-lg:h-20 max-lg:items-center max-lg:justify-between max-lg:w-full max-lg:border-0 max-lg:border-t-2 h-full max-lg:flex max-lg:shrink-0"
    >
      <RouterLink
        to="/"
        class="inline-flex items-center relative gap-2 max-lg:hidden mb-2"
      >
        <img src="/logo.png" class="w-12" />
        <h1 class="font-black text-xl">LinguSeñas</h1>
        <h2
          class="font-black text-teal-500 text-2xl absolute inset-x-0 -bottom-3.5 translate-x-1/2 -z-1"
        >
          Studio
        </h2>
      </RouterLink>

      <RouterLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="px-4 py-2 max-lg:p-2 rounded-2xl text-nowrap border-2 border-transparent inline-flex text-base max-lg:w-auto w-full items-center max-lg:justify-center gap-2 uppercase font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
        active-class="bg-teal-600 hover:text-white text-white border-teal-800!"
      >
        <FontAwesomeIcon :icon="link.icon" class="text-2xl" />
        <span class="max-lg:hidden">{{ link.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
