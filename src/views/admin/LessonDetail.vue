<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import pb from "@/services/pb";
import {
  faPlus,
  faTrash,
  faVideo,
  faArrowLeft,
  faImage,
  faFileUpload,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const route = useRoute();
const router = useRouter();
const lessonId = route.params.id;

// Estados principales
const lesson = ref(null);
const challenges = ref([]);
const signs = ref([]);

// Estado de selección del Reto activo en el Timeline
const activeChallengeIndex = ref(0);
const isEditingExisting = ref(false);

// Formulario del Reto
const challengeForm = ref({
  id: null,
  challenge_type: "DEMO",
  target_type: "sign",
  target_id: "",
  sentence: "",
  position: 1,
  config_options: ["", "", ""],
  config_correct_answer: "",
});

const challengeTypeOptions = [
  { label: "Demostración / Explicación", value: "DEMO" },
  { label: "Opción Múltiple", value: "QUIZ_MULTIPLE" },
  { label: "Quiz Inverso", value: "REVERSE_QUIZ" },
  { label: "Emparejamiento", value: "MATCHING" },
  { label: "Práctica Libre", value: "FREE_PRACTICE" },
];

const categoryOptions = [
  { label: "Sustantivo", value: "sustantivo" },
  { label: "Verbo", value: "verbo" },
  { label: "Adjetivo", value: "adjetivo" },
  { label: "Expresión / Frase", value: "expresion" },
  { label: "Otro", value: "otro" },
];

// Computed para determinar si el reto activo requiere opciones de respuesta
const requiresOptions = computed(() => {
  return ["QUIZ_MULTIPLE", "REVERSE_QUIZ", "MATCHING"].includes(
    challengeForm.value.challenge_type,
  );
});

// Helper para obtener etiqueta corta en el Timeline (Frame 4)
const getShortLabel = (type) => {
  switch (type) {
    case "DEMO":
      return "Demo";
    case "QUIZ_MULTIPLE":
      return "Quiz";
    case "REVERSE_QUIZ":
      return "Rev. Quiz";
    case "MATCHING":
      return "Match";
    case "FREE_PRACTICE":
      return "Práctica";
    default:
      return "Reto";
  }
};

// Cargar un reto de la lista en el formulario
const loadChallengeIntoForm = (index) => {
  if (challenges.value.length === 0 || index >= challenges.value.length) {
    resetFormForNewChallenge();
    return;
  }

  activeChallengeIndex.value = index;
  isEditingExisting.value = true;
  const item = challenges.value[index];

  let parsedConfig = { options: ["", "", ""], correct_answer: "" };
  try {
    if (item.challenge_config) {
      parsedConfig =
        typeof item.challenge_config === "string"
          ? JSON.parse(item.challenge_config)
          : item.challenge_config;
    }
  } catch (e) {
    console.warn("No se pudo parsear el JSON de challenge_config", e);
  }

  challengeForm.value = {
    id: item.id,
    challenge_type: item.challenge_type || "DEMO",
    target_type: item.target_type || "sign",
    target_id: item.target_id || "",
    sentence: item.sentence || "",
    position: item.position || index + 1,
    config_options:
      parsedConfig.options && parsedConfig.options.length
        ? parsedConfig.options
        : ["", "", ""],
    config_correct_answer: parsedConfig.correct_answer || "",
  };
};

const resetFormForNewChallenge = () => {
  activeChallengeIndex.value = challenges.value.length;
  isEditingExisting.value = false;
  challengeForm.value = {
    id: null,
    challenge_type: "DEMO",
    target_type: "sign",
    target_id: "",
    sentence: "",
    position: challenges.value.length + 1,
    config_options: ["", "", ""],
    config_correct_answer: "",
  };
};

// Cargar datos iniciales
const fetchLessonData = async () => {
  try {
    lesson.value = await pb.collection("lessons").getOne(lessonId);

    const challengeRecords = await pb.collection("challenges").getFullList({
      filter: `lesson_id = "${lessonId}"`,
      sort: "position",
    });
    challenges.value = challengeRecords;

    const signRecords = await pb.collection("signs").getFullList({
      sort: "gloss",
    });
    signs.value = [...signRecords];

    if (challenges.value.length > 0) {
      loadChallengeIntoForm(0);
    } else {
      resetFormForNewChallenge();
    }
  } catch (error) {
    console.error("Error al cargar los datos de la lección:", error);
  }
};

onMounted(() => {
  fetchLessonData();
});

const goBack = () => {
  router.push("/studio/route");
};

// Guardar Reto (Crear o Editar)
const saveChallenge = async () => {
  try {
    let configData = {};
    if (requiresOptions.value) {
      configData = {
        options: challengeForm.value.config_options,
        correct_answer: challengeForm.value.config_correct_answer,
      };
    }

    const payload = {
      lesson_id: lessonId,
      challenge_type: challengeForm.value.challenge_type,
      target_type: challengeForm.value.target_type,
      target_id: challengeForm.value.target_id || null,
      sentence: challengeForm.value.sentence,
      position: Number(challengeForm.value.position),
      challenge_config: JSON.stringify(configData),
    };

    if (challengeForm.value.id) {
      await pb.collection("challenges").update(challengeForm.value.id, payload);
    } else {
      await pb.collection("challenges").create(payload);
    }

    const savedIndex = activeChallengeIndex.value;
    await fetchLessonData();
    if (savedIndex < challenges.value.length) {
      loadChallengeIntoForm(savedIndex);
    }
  } catch (error) {
    console.error("Error al guardar el reto:", error);
    alert("Hubo un error al registrar el reto.");
  }
};

const deleteChallenge = async () => {
  if (!challengeForm.value.id) return;
  if (!confirm("¿Estás seguro de eliminar este reto?")) return;

  try {
    await pb.collection("challenges").delete(challengeForm.value.id);
    await fetchLessonData();
  } catch (error) {
    console.error("Error al eliminar el reto:", error);
  }
};

// --- MODAL DE SEÑAS AL VUELO ---
const isSignModalOpen = ref(false);
const isUploadingSign = ref(false);

const signForm = ref({
  gloss: "",
  meaning: "",
  description: "",
  grammatical_category: "sustantivo",
});

const videoFile = ref(null);
const imageFile = ref(null);
const representationImageFile = ref(null);

const handleVideoChange = (e) => {
  videoFile.value = e.target.files[0] || null;
};
const handleImageChange = (e) => {
  imageFile.value = e.target.files[0] || null;
};
const handleRepresentationImageChange = (e) => {
  representationImageFile.value = e.target.files[0] || null;
};

const saveNewSign = async () => {
  try {
    isUploadingSign.value = true;

    const formData = new FormData();
    formData.append("gloss", signForm.value.gloss);
    formData.append("meaning", signForm.value.meaning);
    formData.append("description", signForm.value.description);
    formData.append(
      "grammatical_category",
      signForm.value.grammatical_category,
    );

    if (videoFile.value) formData.append("video", videoFile.value);
    if (imageFile.value) formData.append("image", imageFile.value);
    if (representationImageFile.value) {
      formData.append("representation_image", representationImageFile.value);
    }

    const newSign = await pb.collection("signs").create(formData);

    const signRecords = await pb
      .collection("signs")
      .getFullList({ sort: "gloss" });
    signs.value = [...signRecords];

    challengeForm.value.target_id = newSign.id;
    isSignModalOpen.value = false;

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
  <!-- Header Principal -->
  <header
    class="w-full max-w-2xl mx-auto px-6 flex items-center justify-between border-b border-slate-200 h-16 bg-white sticky top-0"
  >
    <div class="flex items-center gap-3">
      <button
        @click="goBack"
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
      >
        <FontAwesomeIcon :icon="faArrowLeft" class="text-base" />
      </button>
      <div>
        <span
          class="text-[10px] font-black text-teal-600 uppercase tracking-wider"
          >Editor de Lección</span
        >
        <h1
          class="font-black text-sm text-teal-950 truncate max-w-[200px] sm:max-w-md"
        >
          {{ lesson ? lesson.title : "Cargando..." }}
        </h1>
      </div>
    </div>
  </header>

  <!-- Contenido Principal: Formulario Inline del Reto Seleccionado -->
  <main class="w-full overflow-y-auto max-w-2xl mx-auto h-full pb-24">
    <!-- Sub-Header: Línea de Tiempo Horizontal (Frame 4) -->
    <div
      class="w-full max-w-2xl px-2 mx-auto bg-slate-100/90 border-b border-slate-200 py-2 mb-4"
    >
      <div class="text-center">
        <span class="text-xs font-black text-slate-700 tracking-tight"
          >Línea de Tiempo</span
        >
      </div>

      <!-- Container con Scroll Horizontal -->
      <div
        class="flex items-center gap-2"
      >
        <div class=" lex items-center gap-2 overflow-x-auto no-scrollbar w-full h-15 px-4 flex items-center gap-2">
          <button
            v-for="(item, idx) in challenges"
            :key="item.id || idx"
            @click="loadChallengeIntoForm(idx)"
            :class="[
              'px-3.5 py-1.5 rounded-2xl text-xs font-black border-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
              activeChallengeIndex === idx && isEditingExisting
                ? 'bg-teal-500 text-white border-teal-600 shadow-sm scale-105'
                : 'bg-white text-slate-700 border-slate-300 hover:border-teal-400',
            ]"
          >
            <span>{{ idx + 1 }}. {{ getShortLabel(item.challenge_type) }}</span>
          </button>
        </div>

        <div class="w-min p-2 border-l-2 border-slate-300 flex items-center justify-center">
          <button
            @click="resetFormForNewChallenge"
            :class="[
              'w-9 h-9 rounded-2xl border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all',
              !isEditingExisting
                ? 'bg-teal-500 text-white border-teal-600 scale-105'
                : 'bg-white text-teal-600 border-teal-500 hover:bg-teal-50',
            ]"
            title="Agregar nuevo reto"
          >
            <FontAwesomeIcon :icon="faPlus" class="text-sm" />
          </button>
        </div>
      </div>
    </div>
    <div class="bg-white p-4 rounded-3xl space-y-4">
      <div
        class="flex items-center justify-between pb-3 border-b border-slate-100"
      >
        <h2 class="font-black text-teal-950 text-base">
          {{
            isEditingExisting
              ? `Configurar Reto #${activeChallengeIndex + 1}`
              : "Crear Nuevo Reto"
          }}
        </h2>

        <button
          v-if="isEditingExisting"
          @click="deleteChallenge"
          class="text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faTrash" />
          <span>Eliminar</span>
        </button>
      </div>

      <form @submit.prevent="saveChallenge" class="space-y-4">
        <!-- Selector del Tipo de Reto -->
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
            <label class="font-black text-teal-900 text-sm"
              >Seña Asociada</label
            >
            <button
              type="button"
              @click="isSignModalOpen = true"
              class="text-xs font-black text-teal-700 hover:underline cursor-pointer"
            >
              + Crear nueva seña
            </button>
          </div>
          <select
            v-model="challengeForm.target_id"
            class="px-4 py-2 rounded-2xl w-full text-base font-bold border-2 border-slate-300 bg-gray-50 focus:border-teal-600 focus:outline-none transition-colors"
          >
            <option value="" disabled selected>
              Seleccionar seña del diccionario
            </option>
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
          Enunciado o Pregunta
        </Input>

        <!-- Configuración de Opciones (SOLO visible si NO es DEMO o FREE_PRACTICE) -->
        <div
          v-if="requiresOptions"
          class="p-4 rounded-2xl bg-teal-50/50 border-2 border-teal-100 space-y-3"
        >
          <h3 class="font-black text-teal-900 text-xs uppercase tracking-wider">
            Opciones de Respuesta
          </h3>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-600"
              >Opciones incorrectas / alternativas:</label
            >
            <input
              v-for="(opt, idx) in challengeForm.config_options"
              :key="idx"
              v-model="challengeForm.config_options[idx]"
              type="text"
              :placeholder="`Opción ${idx + 1}`"
              class="px-3 py-2 rounded-xl w-full text-sm font-bold border-2 border-slate-200 bg-white focus:border-teal-600 focus:outline-none"
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

        <div class="pt-2">
          <Button type="submit" variant="studio" class="w-full">
            {{
              isEditingExisting
                ? "Guardar Cambios del Reto"
                : "Añadir Reto a la Lección"
            }}
          </Button>
        </div>
      </form>
    </div>

    <!-- BottomSheet Modal: Registrar Nueva Seña al Vuelo (Se mantiene intacto) -->
    <BottomSheet
      v-model="isSignModalOpen"
      title="Registrar Nueva Seña"
    >
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
          <label class="font-black text-teal-900 text-sm"
            >Descripción de ejecución</label
          >
          <textarea
            v-model="signForm.description"
            rows="2"
            class="px-4 py-2 resize-none rounded-2xl w-full text-base font-bold border-2 border-slate-200 bg-gray-50 focus:border-teal-600 focus:outline-none"
            placeholder="Cómo realizar el gesto..."
          ></textarea>
        </div>

        <!-- Archivo 1: Video (.mp4) -->
        <div class="flex flex-col gap-1 w-full">
          <label
            class="font-black text-teal-900 text-sm flex items-center gap-1.5"
          >
            <FontAwesomeIcon :icon="faVideo" class="text-teal-600" /> Video de
            la Seña (.mp4)
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
          <label
            class="font-black text-teal-900 text-sm flex items-center gap-1.5"
          >
            <FontAwesomeIcon :icon="faImage" class="text-teal-600" /> Imagen de
            la Seña (.jpg, .png)
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
          <label
            class="font-black text-teal-900 text-sm flex items-center gap-1.5"
          >
            <FontAwesomeIcon :icon="faFileUpload" class="text-teal-600" />
            Imagen de Ilustración / Representación
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,.jpg,.png"
            @change="handleRepresentationImageChange"
            class="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 text-xs font-bold text-slate-500 cursor-pointer"
          />
        </div>

        <div class="pt-4">
          <Button
            type="submit"
            variant="studio"
            class="w-full"
            :disabled="isUploadingSign"
          >
            {{
              isUploadingSign
                ? "Subiendo Archivos..."
                : "Guardar Seña y Asociar"
            }}
          </Button>
        </div>
      </form>
    </BottomSheet>
  </main>
</template>
