<script setup>
  import pb from "@/services/pb"
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
  <header class="w-full h-[80px] bg-white shadow-md px-4 flex items-center justify-between">
    
    
    <span v-if="isLoading">Cargando...</span>
    <div v-else-if="stats" class="w-full flex items-center justify-between">
      <span>{{stats.current_level}}</span>
      <span>{{stats.current_streak}}</span>
      <span>{{stats.total_score}}</span>
      <span>{{stats.current_hearts}}</span>
    </div>
    <p v-else>No se encontraron registros de juego para el ID: {{ currentUser?.id }}</p>
  </header>
</template>
