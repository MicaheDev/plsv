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
        <h1>Bienvenido</h1>
        <br>
        <button @click="logout">Cerrar sesion</button>
    </div>
</template>