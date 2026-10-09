<script setup>
import pb from "@/services/pb";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref, onMounted } from "vue";
import {
  faShield,
  faFire,
  faHeart,
  faGem,
  faHouse,
  faBookBookmark,
  faCrown,
  faUserGear,
  faTriangleExclamation,
  faShop,
} from "@fortawesome/free-solid-svg-icons";

const currentUser = ref(pb.authStore.record);
const stats = ref(null);
const isLoading = ref(true);

import clsx from "clsx";
const links = [
  {
    path: "/learning",
    icon: faHouse,
    label: "Inicio",
  },
  {
    path: "/dictionary",
    icon: faBookBookmark,
    label: "Diccionario",
  },
  {
    path: "/ranking",
    icon: faCrown,
    label: "Ranking",
  },
  {
    path: "/Store",
    icon: faShop,
    label: "Tienda",
  },

  {
    path: "/profile",
    icon: faUserGear,
    label: "Perfil",
  },
  {
    path: "/sos",
    icon: faTriangleExclamation,
    label: "Emergencias",
  },
];

onMounted(async () => {
  if (!currentUser.value) {
    isLoading.value = false;
    return;
  }

  try {
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
</script>

<template>
  <div class="w-full h-svh flex flex-row-reverse max-lg:flex-col">
    <div
      class="w-full h-full flex flex-row-reverse max-lg:flex-col justify-center overflow-hidden"
    >
      <header class="w-min h-15 max-lg:shrink-0 max-lg:w-full max-lg:bg-white">
        <div class="w-full h-full flex items-center px-4">
          <span v-if="isLoading">Cargando...</span>
          <div
            v-else-if="stats"
            class="w-full flex items-center justify-between gap-2"
          >
            <span
              class="inline-flex items-center gap-1 pr-3 pl-2 py-2 font-bold rounded-xl text-emerald-500"
            >
              <FontAwesomeIcon :icon="faShield" class="text-2xl" />
              {{ stats.current_level }}
            </span>
            <span
              class="inline-flex items-center gap-1 pr-3 pl-2 py-2 font-bold rounded-xl text-orange-500"
            >
              <FontAwesomeIcon :icon="faFire" class="text-2xl" />
              {{ stats.current_streak }}
            </span>
            <span
              class="inline-flex items-center gap-1 pr-3 pl-2 py-2 font-bold rounded-xl text-blue-500"
            >
              <FontAwesomeIcon :icon="faGem" class="text-2xl" />
              {{ stats.total_score }}
            </span>
            <span
              class="inline-flex items-center gap-1 pr-3 pl-2 py-2 font-bold rounded-xl text-red-500"
            >
              <FontAwesomeIcon :icon="faHeart" class="text-2xl" />
              {{ stats.current_hearts }}
            </span>
          </div>
          <p v-else>
            No se encontraron registros de juego para el ID:
            {{ currentUser?.id }}
          </p>
        </div>
      </header>
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
        class="inline-flex items-center gap-2 max-lg:hidden mb-2"
      >
        <img src="/logo.png" class="w-12" />
        <h1 class="font-black text-xl">LinguSeñas</h1>
      </RouterLink>

      <RouterLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        :class="
          clsx(
            'px-4 py-2 max-lg:p-2 rounded-xl text-nowrap border-2 border-transparent inline-flex text-base max-lg:w-auto w-full items-center max-lg:justify-center gap-2 uppercase font-bold text-gray-500 hover:text-gray-700 cursor-pointer',
            {
              'text-red-500 hover:text-red-700': link.label === 'Emergencias',
              'bg-blue-500 hover:text-white text-white border-blue-800!':
                $route.path === link.path,
              'bg-red-500 hover:text-white text-white border-red-800!':
                $route.path === link.path && link.label === 'Emergencias',
            },
          )
        "
      >
        <FontAwesomeIcon :icon="link.icon" class="text-2xl" />
        <span class="max-lg:hidden">{{ link.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
