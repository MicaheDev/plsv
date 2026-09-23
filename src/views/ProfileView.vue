<script setup>
import Button from "@/components/Button.vue";
import pb from "@/services/pb"
import { fechaFormateada } from "@/utilities/formatDate";
import { ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const currentUser = ref(pb.authStore.record)

function logout() {
    pb.authStore.clear()
    router.push("/login")
}


</script>

<template>
    <div class="w-full h-full p-4 flex flex-col justify-between gap-2">
        <div class="w-full flex flex-col gap-2">
            <img class="w-30 h-30 mx-auto rounded-full bg-gray-300" :src="currentUser.avatar" alt="">
            <h2 class="font-black text-2xl text-center">{{ currentUser.full_name }}</h2>
            <span class="mx-auto px-4 py-2 text-white uppercase font-bold bg-blue-500 w-min text-nowrap rounded-xl">{{
                currentUser.role }}</span>

            <span class="text-lg text-center text-fg-muted">{{ currentUser.email }}</span>
            <span class="text-center">{{ fechaFormateada(currentUser.created) }}</span>
        </div>
        <Button class="w-full" variant="primary" @click="logout">Cerrar sesion</Button>
    </div>
</template>