<script setup>
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import pb from '@/services/pb';
import LinkButton from '@/components/LinkButton.vue';

const isLoading = ref(false);
const errorMessage = ref('');

const router = useRouter();

const form = reactive({
    fullName: "",
    username: "", 
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
        // Enviar todo en UNA SOLA petición de creación de usuario:
        await pb.collection('users').create({
            full_name: form.fullName,
            username: form.username,
            email: form.email,
            password: form.password,
            passwordConfirm: form.passwordConfirm,
            role: form.role,
            emailVisibility: true,

            // 📍 DATOS EXTRA PARA EL HOOK:
            level_preference: onboardingPreferences.value.lsvLevel || "NONE",
            daily_goal: parseInt(onboardingPreferences.value.dailyGoal) || 10,
            audio_mode: onboardingPreferences.value.audioMode || "FULL_AUDIO"
        });

        // Iniciar sesión
        await pb.collection('users').authWithPassword(form.username, form.password);

        localStorage.removeItem('temp_preferences_data');
        router.push('/learning');

    } catch (error) {
        console.error("Error en el registro:", error);
        errorMessage.value = error.message || 'Error al registrar el usuario.';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <!-- Mensaje de Error -->

    <div class="w-full min-h-full flex flex-col justify-center items-center max-w-2xl mx-auto p-4">

        <form @submit.prevent="handleOnSubmit"
            class="w-full h-full flex flex-col justify-center max-lg:justify-between gap-4">
            <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-2">
                    <h1 class="text-2xl font-black text-center">Crear una Cuenta</h1>
                    <p class="text-fg-muted font-medium text-center text-sm">Bienvenido de vuelta. Por favor, ingresa
                        tus
                        credenciales.</p>
                </div>

                <Input type="text" v-model="form.fullName" minlength="3" required placeholder="Jose Perez">
                    Nombre completo
                </Input>

                <!-- Input para Nombre de Usuario -->
                <Input type="text" v-model="form.username" minlength="3" required placeholder="joseperez" autocomplete="username">
                    Nombre de usuario
                </Input>

                <Input type="email" v-model="form.email" required placeholder="pedrito@gmail.com" autocomplete="email">
                    E-mail
                </Input>

                <Input type="password" v-model="form.password" required placeholder="••••••••">
                    Contraseña
                </Input>

                <Input type="password" v-model="form.passwordConfirm" required placeholder="••••••••">
                    Confirmar Contraseña
                </Input>

                <div v-if="errorMessage"
                    class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                    {{ errorMessage }}
                </div>
            </div>
            <div class="w-full flex flex-row gap-3 max-lg:flex-col justify-center">

                <Button class="w-full" type="submit" :disabled="isLoading">
                    {{ isLoading ? 'Registrando...' : 'Registrarse' }}
                </Button>
            
                <LinkButton class="w-full" to="/login" variant="secondary">
                    Ya tengo una cuenta
                </LinkButton>
            </div>

        </form>

    </div>
</template>
