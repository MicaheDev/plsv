<script setup>
  import pb from "@/services/pb"
  import { useRouter } from 'vue-router';
import Header from "@/components/Header.vue"
  const router = useRouter();
  
  function logout(){
    pb.authStore.clear()
    router.push("/login")
  }
</script>

<template>
  <Header/>
    <div class="p-6">
        <h1>Bienvenido</h1>
        <br>
        <button @click="logout">Cerrar sesion</button>
    </div>
</template>