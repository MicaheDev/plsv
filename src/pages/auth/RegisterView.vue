<script setup>
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import pb from '@/services/pb';

const isLoading = ref(false);
const errorMessage = ref('');

const router = useRouter();

const form = reactive({
    fullName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "STUDENT"
});

const onboardingPreferences = ref({});

onMounted(() => {
    const rawData = localStorage.getItem('temp_preferences_data');
    onboardingPreferences.value = rawData ? JSON.parse(rawData) : {};
});

async function handleOnSubmit() {
    isLoading.value = true;
    errorMessage.value = '';

    if (form.password !== form.passwordConfirm) {
        errorMessage.value = 'Las contraseñas no coinciden.';
        isLoading.value = false;
        return;
    }

    try {
        // 1. Crear el usuario
        const userRecord = await pb.collection('users').create({
            full_name: form.fullName,
            email: form.email,
            password: form.password,
            passwordConfirm: form.passwordConfirm,
            role: form.role,
            emailVisibility: true
        });

        // 2. Crear las preferencias vinculadas al ID del usuario
        await pb.collection('user_preferences').create({
            user: userRecord.id,
            level_preference: onboardingPreferences.value.lsvLevel || "NONE",
            daily_goal: parseInt(onboardingPreferences.value.dailyGoal) || 10,
            audio_mode: onboardingPreferences.value.audioMode || "FULL_AUDIO"
        });

        // 3. Crear las estadísticas iniciales del juego
        await pb.collection('user_game_stats').create({
            user: userRecord.id,
            current_level: "A1",
            current_hearts: 5,
            total_score: 0,
            current_streak: 0,
            last_activity_day: new Date().toISOString()
        });

        // 4. Iniciar sesión e ingresar
        await pb.collection('users').authWithPassword(form.email, form.password);

        localStorage.removeItem('temp_preferences_data');
        router.push('/learning');


    } catch (error) {
        console.error("Error en el proceso de registro:", error);
        errorMessage.value = error.message || 'Error al registrar el usuario.';
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
    <div class="c-register-container">
        <form @submit.prevent="handleOnSubmit">
            <h1>Register</h1>
            <br>

            <label for="full_name">Nombre completo</label><br>
            <input type="text" id="full_name" v-model="form.fullName" minlength="3" required
                placeholder="Pedro Pérez"><br>
            <br>

            <label for="email">Correo electrónico</label><br>
            <input type="email" id="email" v-model="form.email" required placeholder="pedrito20@example.com"><br>
            <br>

            <label for="password">Contraseña</label><br>
            <input type="password" id="password" v-model="form.password" minlength="8" required placeholder="••••"><br>
            <br>

            <label for="confirm-password">Confirmar Contraseña</label><br>
            <input type="password" id="confirm-password" v-model="form.passwordConfirm" minlength="8" required
                placeholder="••••"><br>
            <br>

            <button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Registrando...' : 'Registrarse e Ingresar' }}
            </button>
        </form>

        <br>
        <RouterLink to="login">Ya tengo una cuenta</RouterLink>

    </div>
</template>

<style scoped>
.c-register-container {
    width: 100%;
    height: 100svh;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    padding: 20px;
}

h1 {
    text-align: center;
}

form {
    width: 100%;
}

input {
    width: 100%;
    padding: 10px 8px;
}

button {
    width: 100%;
    padding: 20px;
}
</style>