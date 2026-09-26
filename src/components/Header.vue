<script setup>
import pb from "@/services/pb"
import { PhFire, PhHeart, PhShield, PhSketchLogo } from "@phosphor-icons/vue"
import { ref, onMounted } from 'vue'

const currentUser = ref(pb.authStore.record)
const stats = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  if (!currentUser.value) {
    isLoading.value = false
    return
  }

  try {
    // Búsqueda con ID entre comillas
    const userId = currentUser.value.id
    const gameStats = await pb.collection("user_game_stats").getFirstListItem(`user = "${userId}"`)

    stats.value = gameStats
  } catch (error) {
    console.log("Estado de la respuesta de PocketBase:", error.status)
    if (error.status === 404) {
      console.warn("No se encontró el registro para este ID de usuario o las API Rules lo están bloqueando.")
    } else {
      console.error("Error al consultar:", error)
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <header class="w-min h-15 max-lg:shrink-0 max-lg:w-full max-lg:bg-white">
    <div class="w-full h-full flex items-center px-4">
      <span v-if="isLoading">Cargando...</span>
      <div v-else-if="stats" class="w-full flex items-center justify-between gap-2">
        <span class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400 font-bold border-2 rounded-xl">
          <PhShield :size="20" />
          {{ stats.current_level }}
        </span>
        <span class="inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white font-bold border-2 rounded-xl">
          <PhFire :size="20" />
          {{ stats.current_streak }}
        </span>
        <span class="inline-flex items-center gap-1 px-2 py-1 bg-indigo-300 font-bold border-2 rounded-xl">

          <PhSketchLogo :size="20" />
          {{ stats.total_score }}
        </span>
        <span class="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white font-bold border-2 rounded-xl">

          <PhHeart :size="20" />
          {{ stats.current_hearts }}
        </span>
      </div>
      <p v-else>No se encontraron registros de juego para el ID: {{ currentUser?.id }}</p>
    </div>
  </header>
</template>
