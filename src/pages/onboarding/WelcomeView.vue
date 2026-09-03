<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { questionary } from './utilities/questionary';

const route = useRoute()
const router = useRouter()

const actualStep = computed(() => route.query.welcomeStep)
const steps = Object.keys(questionary)

const userResponses = ref({
    relationship: '',
    lsvLevel: '',
    dailyGoal: '',
    audioMode: '',
    uiAccessibility: '',
    priorityVocabulary: ''
});


// Esta función ahora procesa el paso y redirige programáticamente
function handleNextStep(currentIndex, currentKey) {
    // 1. Validación (Opcional pero recomendada): 
    // Si el usuario no ha seleccionado nada en este paso, no lo dejes avanzar
    if (!userResponses.value[currentKey]) {
        alert("Por favor, selecciona una opción antes de continuar.");
        return;
    }

    const nextIndex = currentIndex + 1;

    // 2. Si ya respondimos la última pregunta, vamos a registro
    if (steps.length === nextIndex) {
        // Guardamos temporalmente en el localStorage para recuperarlo en la vista de /register
        localStorage.setItem('temp_preferences_data', JSON.stringify(userResponses.value));
        router.push("/register");
        return;
    }

    // 3. Si por alguna razón el paso no existe, volveces al inicio
    if (steps[nextIndex] == null) {
        router.push("/welcome");
        return;
    }

    // 4. Navegamos a la siguiente pregunta
    router.push('/welcome?welcomeStep=' + steps[nextIndex]);
}
</script>

<template>
    <div class="c-welcome-container" v-if="!actualStep">
        <h1>Bienvenido</h1>
        <br>
        <p>Te haremos 6 preguntas para personalizar tu experiencia.</p>
        <br>
        <RouterLink :to="'/welcome?welcomeStep=' + steps[0]">Siguiente</RouterLink>
    </div>

    <div  v-for="([key, value], i) in Object.entries(questionary)" :key="key">

        <div class="c-container" v-if="actualStep === key">
            <form @submit.prevent="handleNextStep(i, key)">
                <h3>
                    {{ value.question }}
                </h3>
                <br>
                <div v-for="option in value.options" :key="option.value">
                    <label>
                        <input type="radio" :name="key" :value="option.value.toUpperCase()" v-model="userResponses[key]" required>

                        {{ option.label }}
                    </label>
                </div>
                <br>
                <button type="submit">Siguiente</button>
            </form>
        </div>
    </div>

</template>

<style scoped>
.c-welcome-container{
    width: 100%;
    height: 100svh;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    padding: 20px;
}

p {
    max-width: 80%;
    text-align: center;
}

button {
    padding: 20px;
}
</style>