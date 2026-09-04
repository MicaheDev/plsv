<script setup>
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
    <!-- Mensaje de Error -->
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
        {{ errorMessage }}
    </div>
    <div class="c-login-container">
        <form @submit.prevent="handleOnSubmit">

            <h1>Login</h1>
            <br>
            <label for="email">Correo electrónico</label><br>
            <input type="email" id="email" v-model="form.email" required placeholder="pedrito20@example.com"><br>
            <br>
            <label for="password">Contraseña</label><br>
            <input type="password" id="password" v-model="form.password" required placeholder="••••"><br>
            <br>

            <button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Accediendo...' : 'Acceder' }}
            </button>
        </form>
        <br>
        <RouterLink to="register">Crear una cuenta</RouterLink>
    </div>
</template>
