<script setup>
import pb from "@/services/pb";
import { ref, onMounted } from "vue";
import {
  PhArrowFatLeft,
  PhArrowLeft,
  PhArrowUDownLeft,
  PhBookBookmark,
  PhCrownSimple,
  PhHouseLine,
  PhPencil,
  PhStorefront,
  PhUserGear,
} from "@phosphor-icons/vue";

const currentUser = ref(pb.authStore.record);
const stats = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  if (!currentUser.value) {
    isLoading.value = false;
    return;
  }

  try {
    // Búsqueda con ID entre comillas
    const userId = currentUser.value.id;
    const gameStats = await pb
      .collection("user_game_stats")
      .getFirstListItem(`user = "${userId}"`);

    stats.value = gameStats;
  } catch (error) {
    console.log("Estado de la respuesta de PocketBase:", error.status);
    if (error.status === 404) {
      console.warn(
        "No se encontró el registro para este ID de usuario o las API Rules lo están bloqueando.",
      );
    } else {
      console.error("Error al consultar:", error);
    }
  } finally {
    isLoading.value = false;
  }
});

const links = [
  {
    path: "/profile",
    icon: PhArrowUDownLeft,
    label: "Volver",
  },
  {
    path: "/studio",
    icon: PhPencil,
    label: "Studio",
  },
  {
    path: "/studio/dictionary",
    icon: PhBookBookmark,
    label: "Diccionario",
  },
];
</script>

<template>
  <div class="w-full h-svh flex flex-row-reverse max-lg:flex-col">
    <div
      class="w-full h-full flex flex-row-reverse max-lg:flex-col justify-center overflow-hidden"
    >
     
      <main
        class="w-full overflow-hidden overflow-y-auto max-w-2xl h-full max-lg:max-w-none"
      >
        <slot></slot>
      </main>
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
        <h2 class="font-black text-teal-500 text-2xl absolute inset-x-0 -bottom-3.5 translate-x-1/2 -z-1">Studio</h2>
      </RouterLink>

      <RouterLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="px-4 py-1 max-lg:p-2.5 rounded-2xl text-nowrap border-2 border-transparent inline-flex text-base max-lg:w-auto w-full items-center max-lg:justify-center gap-2 uppercase font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
        active-class="bg-teal-600 hover:text-white text-white border-teal-800!"
      >
        <component :is="link.icon" :size="32" />
        <span class="max-lg:hidden">{{ link.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
