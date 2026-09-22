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
    <div class="p-6">
        <h1>Bienvenido</h1>
        <br>
        <button @click="logout">Cerrar sesion</button>
    </div>
</template>