<script setup>
  import pb from "@/services/pb"
  import { useRouter } from 'vue-router';
  const router = useRouter();
  
  function logout(){
    pb.authStore.clear()
    router.push("/login")
  }
</script>

<template>
    <div class="w-full h-full p-6 overflow-hidden">
        <h1>AQUI VAN LOS NIVELES Y LECCIONES</h1>
    </div>
</template>