<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import Modal from "@/components/Modal.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import pb from "@/services/pb";
import {
  faArrowLeft,
  faPlus,
  faTrash,
  faGamepad,
  faVideo,
  faImage,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const route = useRoute();
const router = useRouter();
const lessonId = route.params.id;

// Estados principales
const lesson = ref(null);
const challenges = ref([]);
const signs = ref([]);

// Estado del Modal de Retos
const isChallengeModalOpen = ref(false);
const editingChallengeId = ref(null);

// Formulario del Reto
const challengeForm = ref({
  challenge_type: "QUIZ_MULTIPLE",
  target_type: "sign",
  target_id: "",
  sentence: "",
  position: 1,
  config_options: ["", "", ""],
  config_correct_answer: "",
});

const challengeTypeOptions = [
  { label: "Demostración / Explicación (DEMO)", value: "DEMO" },
  { label: "Opción Múltiple (QUIZ_MULTIPLE)", value: "QUIZ_MULTIPLE" },
  { label: "Quiz Inverso (REVERSE_QUIZ)", value: "REVERSE_QUIZ" },
  { label: "Emparejamiento (MATCHING)", value: "MATCHING" },
  { label: "Práctica Libre (FREE_PRACTICE)", value: "FREE_PRACTICE" },
];

const categoryOptions = [
  { label: "Sustantivo", value: "sustantivo" },
  { label: "Verbo", value: "verbo" },
  { label: "Adjetivo", value: "adjetivo" },
  { label: "Expresión / Frase", value: "expresion" },
  { label: "Otro", value: "otro" },
];

// --- FORMULARIO Y SUBIDA DE ARCHIVOS DE SEÑA (DICCIONARIO POCKETBASE) ---
const isSignModalOpen = ref(false);
const isUploadingSign = ref(false);

const signForm = ref({
  gloss: "",
  meaning: "",
  description: "",
  grammatical_category: "sustantivo",
});

// Referencias a los archivos cargados
const videoFile = ref(null);
const imageFile = ref(null);
const representationImageFile = ref(null);

// Manejadores de eventos al seleccionar archivos
const handleVideoChange = (e) => {
  videoFile.value = e.target.files[0] || null;
};
const handleImageChange = (e) => {
  imageFile.value = e.target.files[0] || null;
};
const handleRepresentationImageChange = (e) => {
  representationImageFile.value = e.target.files[0] || null;
};

// Cargar datos iniciales
const fetchLessonData = async () => {
  try {
    lesson.value = await pb.collection("lessons").getOne(lessonId);

    challenges.value = await pb.collection("challenges").getFullList({
      filter: `lesson_id = "${lessonId}"`,
      sort: "position",
    });

    // Forzar la actualización limpia del listado de señas
    const signRecords = await pb.collection("signs").getFullList({
      sort: "gloss",
    });
    signs.value = [...signRecords]; // Usar operador spread para asegurar reactividad en Vue
  } catch (error) {
    console.error("Error al cargar los datos de la lección:", error);
  }
};
onMounted(() => {
  fetchLessonData();
});

const goBack = () => {
  router.push("/studio");
};

// --- CRUD RETOS ---
const openNewChallengeModal = () => {
  editingChallengeId.value = null;
  challengeForm.value = {
    challenge_type: "QUIZ_MULTIPLE",
    target_type: "sign",
    target_id: "",
    sentence: "",
    position: challenges.value.length + 1,
    config_options: ["", "", ""],
    config_correct_answer: "",
  };
  isChallengeModalOpen.value = true;
};

const saveChallenge = async () => {
  try {
    const configData = {
      options: challengeForm.value.config_options,
      correct_answer: challengeForm.value.config_correct_answer,
    };

    const payload = {
      lesson_id: lessonId,
      challenge_type: challengeForm.value.challenge_type,
      target_type: challengeForm.value.target_type,
      target_id: challengeForm.value.target_id || null,
      sentence: challengeForm.value.sentence,
      position: Number(challengeForm.value.position),
      challenge_config: JSON.stringify(configData),
    };

    if (editingChallengeId.value) {
      await pb.collection("challenges").update(editingChallengeId.value, payload);
    } else {
      await pb.collection("challenges").create(payload);
    }

    isChallengeModalOpen.value = false;
    await fetchLessonData();
  } catch (error) {
    console.error("Error al guardar el reto:", error);
    alert("Hubo un error al registrar el reto.");
  }
};

const deleteChallenge = async (challengeId) => {
  if (!confirm("¿Estás seguro de eliminar este reto?")) return;
  try {
    await pb.collection("challenges").delete(challengeId);
    await fetchLessonData();
  } catch (error) {
    console.error("Error al eliminar el reto:", error);
  }
};

// --- CREAR SEÑA MULTIMEDIA CON FORMDATA EN POCKETBASE ---
const saveNewSign = async () => {
  try {
    isUploadingSign.value = true;

    // Crear objeto FormData para adjuntar textos y archivos binarios a PocketBase
    const formData = new FormData();
    formData.append("gloss", signForm.value.gloss);
    formData.append("meaning", signForm.value.meaning);
    formData.append("description", signForm.value.description);
    formData.append("grammatical_category", signForm.value.grammatical_category);

    if (videoFile.value) {
      formData.append("video", videoFile.value);
    }
    if (imageFile.value) {
      formData.append("image", imageFile.value);
    }
    if (representationImageFile.value) {
      formData.append("representation_image", representationImageFile.value);
    }

    // Enviar FormData al endpoint de signs
    const newSign = await pb.collection("signs").create(formData);

    // Actualizar lista y seleccionar automáticamente
    await fetchLessonData();
    challengeForm.value.target_id = newSign.id;
    isSignModalOpen.value = false;

    // Limpiar campos
    signForm.value = {
      gloss: "",
      meaning: "",
      description: "",
      grammatical_category: "sustantivo",
    };
    videoFile.value = null;
    imageFile.value = null;
    representationImageFile.value = null;
  } catch (error) {
    console.error("Error al crear la seña con multimedia:", error);
    alert("Error al subir los archivos de la seña.");
  } finally {
    isUploadingSign.value = false;
  }
};
</script>

<template>
  <!-- <header class="w-full px-6 flex items-center justify-between border-b-2 border-slate-200 h-18 bg-white sticky top-0 z-20">
    <div class="flex items-center gap-3">
      <button
        @click="goBack"
        class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
      >
        <FontAwesomeIcon :icon="faArrowLeft" class="text-lg" />
      </button>
      <div>
        <span class="text-[10px] font-black text-teal-600 uppercase tracking-wider">Editor de Lección</span>
        <h1 class="font-black text-base text-teal-950 truncate max-w-[200px] sm:max-w-md">
          {{ lesson ? lesson.title : 'Cargando...' }}
        </h1>
      </div>
    </div>

    <Button variant="studio" @click="openNewChallengeModal">
      <span>Nuevo Reto</span>
      <template #icon>
        <FontAwesomeIcon :icon="faPlus" />
      </template>
    </Button>
  </header> -->
  

  <!-- Main Content -->
  <main class="w-full overflow-hidden overflow-y-auto max-w-2xl mx-auto h-full max-lg:max-w-none p-4 pb-24">
    <div class="space-y-4">
      <h2 class="font-black text-slate-700 text-sm uppercase tracking-wider">Secuencia de Retos (Timeline)</h2>

      <!-- Lista de Retos -->
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between shadow-sm"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-black flex items-center justify-center">
              {{ challenge.position }}
            </span>
            <span class="text-xs font-black text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
              {{ challenge.challenge_type }}
            </span>
          </div>
          <p class="font-bold text-slate-800 text-sm">
            {{ challenge.sentence || 'Reto basado en seña atómica' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="deleteChallenge(challenge.id)"
            class="w-9 h-9 rounded-xl text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FontAwesomeIcon :icon="faTrash" />
          </button>
        </div>
      </div>

      <!-- Placeholder si no hay retos -->
      <div
        v-if="challenges.length === 0"
        @click="openNewChallengeModal"
        class="p-8 rounded-3xl border-4 border-dashed border-slate-300 bg-slate-50/50 hover:border-teal-500 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-2 group"
      >
        <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
          <FontAwesomeIcon :icon="faGamepad" class="text-xl" />
        </div>
        <span class="font-black text-slate-500 group-hover:text-teal-900">
          No hay retos creados. Presiona aquí para agregar el primero.
        </span>
      </div>
    </div>

    <!-- BottomSheet / Modal: Crear o Editar Reto -->
    <BottomSheet v-model="isChallengeModalOpen" :title="editingChallengeId ? 'Editar Reto' : 'Nuevo Reto'">
      <form @submit.prevent="saveChallenge" class="space-y-4">
        <!-- Tipo de Reto -->
        <Select
          v-model="challengeForm.challenge_type"
          :options="challengeTypeOptions"
          variant="studio"
          required
        >
          Tipo de Reto
        </Select>

        <!-- Selección o Creación de Seña Asociada -->
        <div class="flex flex-col gap-2 w-full">
          <div class="flex justify-between items-center">
            <label class="font-black text-teal-900 text-sm">Seña Asociada (Target)</label>
            <button
              type="button"
              @click="isSignModalOpen = true"
              class="text-xs font-black text-teal-700 hover:underline cursor-pointer"
            >
              + Crear nueva seña al vuelo
            </button>
          </div>
          <select
            v-model="challengeForm.target_id"
            class="px-4 py-2 rounded-2xl w-full text-base font-bold border-2 border-slate-300 bg-gray-50 focus:border-teal-600 focus:outline-none transition-colors"
          >
            <option value="" disabled selected>Seleccionar seña del diccionario</option>
            <option v-for="sign in signs" :value="sign.id" :key="sign.id">
              {{ sign.gloss }} - {{ sign.meaning }}
            </option>
          </select>
        </div>

        <!-- Enunciado / Pregunta del Reto -->
        <Input
          v-model="challengeForm.sentence"
          variant="studio"
          placeholder="Ej. ¿Qué significa esta seña?"
        >
          Enunciado o Pregunta (Sentence)
        </Input>

        <!-- Configuración dinámica de opciones (JSON Config) -->
        <div class="p-4 rounded-2xl bg-teal-50/50 border-2 border-teal-100 space-y-3">
          <h3 class="font-black text-teal-900 text-xs uppercase">Configuración de Opciones (JSON Config)</h3>
          
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-600">Opciones incorrectas / alternativas:</label>
            <input
              v-for="(opt, idx) in challengeForm.config_options"
              :key="idx"
              v-model="challengeForm.config_options[idx]"
              type="text"
              :placeholder="`Opción ${idx + 1}`"
              class="px-3 py-1.5 rounded-xl w-full text-sm font-bold border-2 border-slate-200 bg-white focus:border-teal-600 focus:outline-none"
            />
          </div>

          <Input
            v-model="challengeForm.config_correct_answer"
            variant="studio"
            placeholder="Respuesta correcta exacta"
          >
            Respuesta Correcta
          </Input>
        </div>

        <Input
          v-model="challengeForm.position"
          type="number"
          variant="studio"
          min="1"
          required
        >
          Orden en la Lección
        </Input>

        <div class="pt-4">
          <Button type="submit" variant="studio" class="w-full">
            {{ editingChallengeId ? 'Actualizar Reto' : 'Guardar Reto' }}
          </Button>
        </div>
      </form>
    </BottomSheet>

    <!-- Modal Interno: Registrar Nueva Seña con Carga Multimedia (FormData) -->
    <BottomSheet class="w-full! h-full!" v-model="isSignModalOpen" title="Registrar Nueva Seña (Diccionario)">
      <form @submit.prevent="saveNewSign" class="space-y-4 max-w-2xl mx-auto">
        <Input
          v-model="signForm.gloss"
          variant="studio"
          placeholder="Ej. HOLA"
          required
        >
          Glosa (Nombre de la seña)
        </Input>

        <Input
          v-model="signForm.meaning"
          variant="studio"
          placeholder="Ej. Saludo formal"
          required
        >
          Significado en Español
        </Input>

        <Select
          v-model="signForm.grammatical_category"
          :options="categoryOptions"
          variant="studio"
          required
        >
          Categoría Gramatical
        </Select>

        <div class="flex flex-col gap-2 w-full">
          <label class="font-black text-teal-900 text-sm">Descripción de ejecución</label>
          <textarea
            v-model="signForm.description"
            rows="2"
            class="px-4 py-2 resize-none rounded-2xl w-full text-base font-bold border-2 border-slate-200 bg-gray-50 focus:border-teal-600 focus:outline-none"
            placeholder="Cómo realizar el gesto..."
          ></textarea>
        </div>

        <!-- Archivo 1: Video (.mp4 / audio/mp4) -->
        <div class="flex flex-col gap-1 w-full">
          <label class="font-black text-teal-900 text-sm flex items-center gap-1.5">
            <FontAwesomeIcon :icon="faVideo" class="text-teal-600" /> Video de la Seña (.mp4)
          </label>
          <input
            type="file"
            accept="video/mp4,.mp4"
            @change="handleVideoChange"
            class="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 text-xs font-bold text-slate-500 cursor-pointer"
          />
        </div>

        <!-- Archivo 2: Imagen Principal (.jpg, .png) -->
        <div class="flex flex-col gap-1 w-full">
          <label class="font-black text-teal-900 text-sm flex items-center gap-1.5">
            <FontAwesomeIcon :icon="faImage" class="text-teal-600" /> Imagen de la Seña (.jpg, .png)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,.jpg,.png"
            @change="handleImageChange"
            class="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 text-xs font-bold text-slate-500 cursor-pointer"
          />
        </div>

        <!-- Archivo 3: Imagen de Representación (.jpg, .png) -->
        <div class="flex flex-col gap-1 w-full">
          <label class="font-black text-teal-900 text-sm flex items-center gap-1.5">
            <FontAwesomeIcon :icon="faFileUpload" class="text-teal-600" /> Imagen de Ilustración / Representación
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,.jpg,.png"
            @change="handleRepresentationImageChange"
            class="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 text-xs font-bold text-slate-500 cursor-pointer"
          />
        </div>

        <div class="pt-4">
          <Button type="submit" variant="studio" class="w-full" :disabled="isUploadingSign">
            {{ isUploadingSign ? 'Subiendo Archivos...' : 'Guardar Seña y Asociar' }}
          </Button>
        </div>
      </form>
    </BottomSheet>
  </main>
</template>