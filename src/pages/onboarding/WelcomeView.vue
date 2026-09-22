<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { questionary } from './utilities/questionary';
import Button from '@/components/Button.vue';

const route = useRoute()
const router = useRouter()

const actualStep = computed(() => route.query.welcomeStep)
const steps = Object.keys(questionary)

// 1. Obtenemos el objeto de la pregunta actual según la URL
const currentQuestionData = computed(() => {
  if (!actualStep.value) return null;
  return questionary[actualStep.value] || null;
});

// 2. Calculamos el índice actual dinámicamente
const currentIndex = computed(() => {
  return steps.indexOf(actualStep.value);
});

const userResponses = ref({
  relationship: '',
  lsvLevel: '',
  dailyGoal: '',
  audioMode: '',
  uiAccessibility: '',
  priorityVocabulary: ''
});

function handleNextStep() {
  const key = actualStep.value;
  const idx = currentIndex.value;

  if (!userResponses.value[key]) {
    alert("Por favor, selecciona una opción antes de continuar.");
    return;
  }

  const nextIndex = idx + 1;

  if (steps.length === nextIndex) {
    localStorage.setItem('temp_preferences_data', JSON.stringify(userResponses.value));
    router.push("/register");
    return;
  }

  if (steps[nextIndex] == null) {
    router.push("/welcome");
    return;
  }

  router.push('/welcome?welcomeStep=' + steps[nextIndex]);
}
</script>

<template>
  <!-- Pantalla de Bienvenida (Paso inicial sin query) -->
  <div 
    v-if="!actualStep" 
    class="w-full h-full flex flex-col justify-center items-center max-w-2xl mx-auto p-4 gap-4"
  >
    <h1 class="text-4xl font-black">Bienvenido</h1>
    <p class="text-lg text-center">Te haremos 6 preguntas para personalizar tu experiencia.</p>
    <Button 
      class="w-full" 
      variant="primary"
      @click="router.push('/welcome?welcomeStep=' + steps[0])"
    >
      Siguiente
    </Button>
  </div>

  <!-- Paso del Cuestionario (Único contenedor activo) -->
  <div 
    v-else-if="currentQuestionData" 
    class="w-full h-full flex flex-col justify-center items-center max-w-2xl mx-auto p-4 gap-4"
  >
    <form 
      class="w-full h-full flex flex-col justify-center max-lg:justify-between gap-4"
      @submit.prevent="handleNextStep"
    >
      <div class="flex flex-col gap-3">
        <h3 class="font-bold text-xl">
          {{ currentQuestionData.question }}
        </h3>
        
        <div class="w-full flex flex-col gap-2">
            <div 
          v-for="option in currentQuestionData.options" 
          :key="option.value"
          class="flex items-center gap-2"
        >
          <label class="flex items-center gap-2 cursor-pointer w-full p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <input 
              type="radio" 
              :name="actualStep" 
              :value="option.value.toUpperCase()"
              v-model="userResponses[actualStep]" 
              required
            >
            <span>{{ option.label }}</span>
          </label>
        </div>
        </div>
      </div>

      <Button class="w-full" type="submit" variant="primary">
        Siguiente
      </Button>
    </form>
  </div>
</template>