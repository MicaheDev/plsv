<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@/components/Button.vue';

const questionary = {
  relationship: {
    question: "¿Cuál es tu relación con la U.E. Bartolomé Salom?",
    questionType: "single",
    options: [
      { label: "Soy Docente / Personal de la escuela", value: "teacher" },
      { label: "Soy Representante / Familiar", value: "guest" },
      { label: "Soy Estudiante", value: "student" },
    ]
  },
  lsvLevel: {
    question: "¿Cuánto sabes sobre Lengua de Señas Venezolana (LSV)?",
    questionType: "single",
    options: [
      { label: "Cero: No sé nada, quiero empezar desde el alfabeto.", value: "none" },
      { label: "Básico: Conozco algunas señas sueltas y el abecedario.", value: "basic" },
      { label: "Intermedio: Puedo entablar conversaciones muy sencillas.", value: "intermediate" }
    ]
  },
  dailyGoal: {
    question: "¿Cuánto tiempo deseas dedicarle al día?",
    questionType: "single",
    options: [
      { label: "Relajado: 5 minutos al día.", value: "5" },
      { label: "Normal: 10 minutos al día.", value: "10" },
      { label: "Serio: 20 minutos al día.", value: "20" }
    ]
  },
  audioMode: {
    question: "¿Cómo prefieres aprender hoy?",
    questionType: "single",
    options: [
      { label: "Visual y Auditivo: Con apoyo de voz y sonidos.", value: "full_audio" },
      { label: "Solo Visual: Sin sonido (ideal para entornos silenciosos o comunidad sorda).", value: "visual_only" }
    ]
  },
  uiAccessibility: {
    question: "Preferencias de visualización (Accesibilidad):",
    questionType: "single",
    options: [
      { label: "Interfaz estándar (con animaciones y efectos visuales).", value: "standard" },
      { label: "Interfaz simplificada (sin animaciones y alto contraste).", value: "simplified" }
    ]
  },
  priorityVocabulary: {
    question: "¿Qué vocabulario te interesa priorizar primero?",
    questionType: "single",
    options: [
      { label: "Vocabulario del Aula y Escuela (Útil para docentes)", value: "school" },
      { label: "Emociones y Salud (Vital para mediar en crisis)", value: "health" },
      { label: "Expresiones Cotidianas y Hogar", value: "home" },
      { label: "Cultura y Festividades (Tradiciones y religión)", value: "culture" }
    ]
  }
}

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
  <div v-if="!actualStep" class="w-full h-full flex flex-col justify-center items-center max-w-2xl mx-auto p-4 gap-4">
    <h1 class="text-4xl font-black">Bienvenido</h1>
    <p class="text-lg text-center">Te haremos 6 preguntas para personalizar tu experiencia.</p>
    <Button class="w-full" variant="primary" @click="router.push('/welcome?welcomeStep=' + steps[0])">
      Siguiente
    </Button>
  </div>

  <!-- Paso del Cuestionario (Único contenedor activo) -->
  <div v-else-if="currentQuestionData"
    class="w-full h-full flex flex-col justify-center items-center max-w-2xl mx-auto p-4 gap-4">
    <form class="w-full h-full flex flex-col justify-center max-lg:justify-between gap-4"
      @submit.prevent="handleNextStep">
      <div class="flex flex-col gap-3">
        <h3 class="font-bold text-xl">
          {{ currentQuestionData.question }}
        </h3>

        <div class="w-full flex flex-col gap-2">
          <div v-for="option in currentQuestionData.options" :key="option.value" class="flex items-center gap-2">
            <label
              class="flex items-center gap-2 cursor-pointer w-full p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <input type="radio" :name="actualStep" :value="option.value.toUpperCase()"
                v-model="userResponses[actualStep]" required>
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