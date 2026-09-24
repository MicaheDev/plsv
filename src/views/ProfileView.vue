<script setup>
import Button from "@/components/Button.vue";
import LinkButton from "@/components/LinkButton.vue";
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

function getRole(role_name) {
    switch (role_name) {
        case "STUDENT":
            return "ESTUDIANTE"
        case "ADMIN":
            return "ADMINISTRADOR"
        case "TEACHER":
            return "DOCENTE"
        case "GUEST":
            return "INVITADO"
        default:
            return "GUEST"
    }
}
</script>

<template>
    <div class="w-full h-full p-4 flex flex-col justify-between gap-2">
        <div class="w-full flex flex-col gap-2">
            <img class="w-30 h-30 mx-auto rounded-full bg-gray-300" :src="currentUser.avatar" alt="">
            <h2 class="font-black text-2xl text-center">{{ currentUser.full_name }}</h2>
            <h3 class="text-center"><span class="font-black">Nombre de usuario:</span> <span
                    class="text-primary-hover font-black">{{ currentUser.username }}</span></h3>
            <div class="flex items-center gap-2 justify-center text-center">
                <span class="font-black">Rol: </span>
                <span class="text-sm px-4 py-2 text-white uppercase font-bold bg-blue-500 w-min text-nowrap rounded-xl">
                    {{ getRole(currentUser.role) }}
                </span>
            </div>

            <span class="text-lg text-center"><span class="font-black">E-mail:</span> {{ currentUser.email }}</span>
            <span class="text-center">Registrado desde <span class="font-black">{{ fechaFormateada(currentUser.created)
            }}</span></span>


        </div>
        <div class="flex flex-col gap-2">
            <LinkButton v-if="currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER'" to="/studio" class="w-full" variant="secondary">MODO STUDIO</LinkButton>

            <Button class="w-full" variant="primary" @click="logout">Cerrar sesion</Button>
        </div>
    </div>
</template>