<script setup>
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import pb from '@/services/pb';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const isLoading = ref(false);
const errorMessage = ref('');

const router = useRouter();

const form = reactive({
    email: "",
    password: "",
});

async function handleOnSubmit() {
    isLoading.value = true;

    try {
        await pb.collection('users').authWithPassword(form.email, form.password);

        router.push('/learning');
    } catch (error) {
        errorMessage.value = error.message || 'Error al iniciar sesión.';

    } finally {
        isLoading.value = false;
    }
}

</script>

<template>

    <div class="w-full h-svh flex flex-col justify-center items-center p-8 box-border">
        <form @submit.prevent="handleOnSubmit" class="flex flex-col justify-between h-full">
            <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-2">
                    <img src="/logo.png" alt="Logo de la aplicación" class="w-25 h-25 mx-auto">
                    <h1 class="text-3xl font-black text-center">Iniciar sesión</h1>
                    <p class="text-fg-muted font-medium text-clip text-sm">Bienvenido de vuelta. Por favor, ingresa tus
                        credenciales.</p>
                </div>
                <Input type="email" v-model="form.email" required placeholder="pedrito@gmail.com" autocomplete="email">
                    E-mail
                </Input>

                <!-- Input para Contraseña -->
                <Input type="password" v-model="form.password" required placeholder="••••••••">
                    Contraseña
                </Input>
                <div v-if="errorMessage"
                    class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                    {{ errorMessage }}
                </div>

            </div>


            <div class="flex flex-col gap-4">
                <Button class="w-full" type="submit" variant="primary">
                    {{ isLoading ? 'Accediendo...' : 'Acceder' }}
                </Button>
                <Button class="w-full" type="button" variant="secondary" @click="router.push('/register')">
                    Crear una cuenta
                </Button>
            </div>
        </form>
    </div>
</template>
