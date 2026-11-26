<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import pb from "@/services/pb";
import {
  faPlus,
  faTrash,
  faArrowLeft,
  faPlay,
  faStop,
  faFilm,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const route = useRoute();
const router = useRouter();
const lessonId = route.params.id;

const DRAFT_KEY = `studio_challenge_draft_${lessonId}`;
const NEW_SIGN_KEY = "studio_newly_created_sign_id";
const NEW_PHRASE_KEY = "studio_newly_created_phrase_id";

// Estados principales
const lesson = ref(null);
const challenges = ref([]);
const signs = ref([]);
const phrases = ref([]);

// Buscadores para señas y frases
const signSearchQuery = ref("");
const phraseSearchQuery = ref("");

// Estado de selección del Reto activo en el Timeline
const activeChallengeIndex = ref(0);
const isEditingExisting = ref(false);
const hasDraftRestored = ref(false);

// Formulario del Reto
const challengeForm = ref({
  id: null,
  challenge_type: "DEMO",
  target_type: "SIGN",
  target_sign: "",
  target_phrase: "",
  sentence: "",
  position: 1,
  config_options: ["", "", ""],
  config_correct_answer: "",
});

// Estado de previsualización (seña individual o secuencia de frase)
const isPreviewPlaying = ref(false);
const phraseSequenceSigns = ref([]);
const isLoadingSequence = ref(false);
const currentSequenceIndex = ref(0);
const previewVideoEl = ref(null);

const challengeTypeOptions = [
  { label: "Demostración / Explicación", value: "DEMO" },
  { label: "Opción Múltiple", value: "QUIZ_MULTIPLE" },
  //{ label: "Opción Múltiple Invertido", value: "REVERSE_QUIZ" },
  //{ label: "Emparejamiento", value: "MATCHING" },
  //{ label: "Práctica Libre", value: "FREE_PRACTICE" },
];

const targetTypeOptions = [
  { label: "Seña", value: "SIGN" },
  { label: "Frase", value: "PHRASE" },
];

const requiresOptions = computed(() => {
  return ["QUIZ_MULTIPLE", "REVERSE_QUIZ", "MATCHING"].includes(
    challengeForm.value.challenge_type,
  );
});

const filteredSigns = computed(() => {
  const q = signSearchQuery.value.trim().toLowerCase();
  if (!q) return signs.value;
  return signs.value.filter(
    (s) =>
      s.gloss?.toLowerCase().includes(q) ||
      s.meaning?.toLowerCase().includes(q),
  );
});

const filteredPhrases = computed(() => {
  const q = phraseSearchQuery.value.trim().toLowerCase();
  if (!q) return phrases.value;
  return phrases.value.filter(
    (p) =>
      p.sentence_meaning?.toLowerCase().includes(q) ||
      p.glosses?.toLowerCase().includes(q) ||
      p.emotion?.toLowerCase().includes(q),
  );
});

const selectedSignObj = computed(
  () => signs.value.find((s) => s.id === challengeForm.value.target_sign) || null,
);

const selectedPhraseObj = computed(
  () =>
    phrases.value.find((p) => p.id === challengeForm.value.target_phrase) ||
    null,
);

const activePreviewSign = computed(() => {
  if (challengeForm.value.target_type === "SIGN") {
    return selectedSignObj.value;
  }
  return phraseSequenceSigns.value[currentSequenceIndex.value] || null;
});

const activePreviewVideoUrl = computed(() => {
  const sign = activePreviewSign.value;
  if (!sign || !sign.video) return "";
  return pb.files.getURL(sign, sign.video);
});

const stopPreview = () => {
  isPreviewPlaying.value = false;
  currentSequenceIndex.value = 0;
  if (previewVideoEl.value) {
    previewVideoEl.value.pause();
  }
};

const loadPhraseOrchestration = async (phraseId) => {
  phraseSequenceSigns.value = [];
  currentSequenceIndex.value = 0;
  if (!phraseId) return;

  isLoadingSequence.value = true;
  try {
    const rows = await pb.collection("phrases_orchestration").getFullList({
      filter: `phrase = "${phraseId}"`,
      sort: "position",
      expand: "sign",
    });
    phraseSequenceSigns.value = rows
      .map((r) => r.expand?.sign)
      .filter(Boolean);
  } catch (err) {
    console.warn("No se pudo cargar la orquestación de la frase:", err);
  } finally {
    isLoadingSequence.value = false;
  }
};

const togglePreview = async () => {
  if (isPreviewPlaying.value) {
    stopPreview();
    return;
  }

  if (challengeForm.value.target_type === "SIGN") {
    if (!selectedSignObj.value) return;
    currentSequenceIndex.value = 0;
    isPreviewPlaying.value = true;
  } else {
    if (!selectedPhraseObj.value) return;
    if (phraseSequenceSigns.value.length === 0) {
      await loadPhraseOrchestration(selectedPhraseObj.value.id);
    }
    if (phraseSequenceSigns.value.length > 0) {
      currentSequenceIndex.value = 0;
      isPreviewPlaying.value = true;
    }
  }
};

const onPreviewVideoEnded = () => {
  if (challengeForm.value.target_type === "PHRASE") {
    if (currentSequenceIndex.value + 1 < phraseSequenceSigns.value.length) {
      currentSequenceIndex.value += 1;
      return;
    }
  }
  stopPreview();
};

watch(
  () => [challengeForm.value.target_type, challengeForm.value.target_phrase],
  ([type, phraseId]) => {
    stopPreview();
    if (type === "PHRASE" && phraseId) {
      loadPhraseOrchestration(phraseId);
    } else {
      phraseSequenceSigns.value = [];
    }
  },
);

watch(
  () => challengeForm.value.target_sign,
  () => {
    if (challengeForm.value.target_type === "SIGN") {
      stopPreview();
    }
  },
);

const selectSign = (sign) => {
  challengeForm.value.target_sign = sign.id;
};

const clearSelectedSign = () => {
  challengeForm.value.target_sign = "";
  stopPreview();
};

const selectPhrase = (phrase) => {
  challengeForm.value.target_phrase = phrase.id;
};

const clearSelectedPhrase = () => {
  challengeForm.value.target_phrase = "";
  phraseSequenceSigns.value = [];
  stopPreview();
};

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
  stopPreview();
  if (challenges.value.length === 0 || index >= challenges.value.length) {
    resetFormForNewChallenge();
    return;
  }

  activeChallengeIndex.value = index;
  isEditingExisting.value = true;
  hasDraftRestored.value = false;
  sessionStorage.removeItem(DRAFT_KEY);

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

  const normalizedType = (item.target_type || "SIGN").toUpperCase();

  challengeForm.value = {
    id: item.id,
    challenge_type: item.challenge_type || "DEMO",
    target_type: normalizedType === "PHRASE" ? "PHRASE" : "SIGN",
    target_sign: item.target_sign || "",
    target_phrase: item.target_phrase || "",
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
  stopPreview();
  activeChallengeIndex.value = challenges.value.length;
  isEditingExisting.value = false;
  hasDraftRestored.value = false;
  sessionStorage.removeItem(DRAFT_KEY);

  challengeForm.value = {
    id: null,
    challenge_type: "DEMO",
    target_type: "SIGN",
    target_sign: "",
    target_phrase: "",
    sentence: "",
    position: challenges.value.length + 1,
    config_options: ["", "", ""],
    config_correct_answer: "",
  };
};

// Guardar borrador del reto antes de ir a crear una seña o frase
const saveDraftAndNavigate = (path) => {
  sessionStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({
      activeChallengeIndex: activeChallengeIndex.value,
      isEditingExisting: isEditingExisting.value,
      form: { ...challengeForm.value },
    }),
  );

  router.push({
    path,
    query: { returnTo: route.fullPath },
  });
};

const goToCreateSign = () => saveDraftAndNavigate("/studio/signs/new");
const goToCreatePhrase = () => saveDraftAndNavigate("/studio/phrases/new");

// Cargar datos iniciales y restaurar borrador / nueva seña o frase si aplica
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

    phrases.value = await pb
      .collection("phrases")
      .getFullList({ sort: "-created" })
      .catch((err) => {
        console.warn("No se pudieron cargar las frases:", err);
        return [];
      });

    const rawDraft = sessionStorage.getItem(DRAFT_KEY);
    const newlyCreatedSignId = sessionStorage.getItem(NEW_SIGN_KEY);
    const newlyCreatedPhraseId = sessionStorage.getItem(NEW_PHRASE_KEY);

    if (rawDraft) {
      const draft = JSON.parse(rawDraft);
      if (typeof draft.activeChallengeIndex === "number") {
        activeChallengeIndex.value = draft.activeChallengeIndex;
      }
      isEditingExisting.value = Boolean(draft.isEditingExisting);
      challengeForm.value = {
        ...challengeForm.value,
        ...(draft.form || {}),
      };
      hasDraftRestored.value = true;
      sessionStorage.removeItem(DRAFT_KEY);
    } else if (challenges.value.length > 0) {
      loadChallengeIntoForm(0);
    } else {
      resetFormForNewChallenge();
    }

    if (newlyCreatedSignId) {
      challengeForm.value.target_type = "SIGN";
      challengeForm.value.target_sign = newlyCreatedSignId;
      challengeForm.value.target_phrase = "";
      sessionStorage.removeItem(NEW_SIGN_KEY);
    }

    if (newlyCreatedPhraseId) {
      challengeForm.value.target_type = "PHRASE";
      challengeForm.value.target_phrase = newlyCreatedPhraseId;
      challengeForm.value.target_sign = "";
      sessionStorage.removeItem(NEW_PHRASE_KEY);
    }

    if (
      challengeForm.value.target_type === "PHRASE" &&
      challengeForm.value.target_phrase
    ) {
      await loadPhraseOrchestration(challengeForm.value.target_phrase);
    }
  } catch (error) {
    console.error("Error al cargar los datos de la lección:", error);
  }
};

onMounted(() => {
  fetchLessonData();
});

const goBack = () => {
  sessionStorage.removeItem(DRAFT_KEY);
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

    const isSign = challengeForm.value.target_type === "SIGN";

    const payload = {
      lesson_id: lessonId,
      challenge_type: challengeForm.value.challenge_type,
      target_type: challengeForm.value.target_type,
      target_sign: isSign ? challengeForm.value.target_sign || null : null,
      target_phrase: !isSign ? challengeForm.value.target_phrase || null : null,
      sentence: challengeForm.value.sentence,
      position: Number(challengeForm.value.position),
      challenge_config: JSON.stringify(configData),
    };

    if (challengeForm.value.id) {
      await pb.collection("challenges").update(challengeForm.value.id, payload);
    } else {
      await pb.collection("challenges").create(payload);
    }

    sessionStorage.removeItem(DRAFT_KEY);
    hasDraftRestored.value = false;

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
</script>

<template>
  <!-- Header Principal -->
  <header
    class="w-full max-w-2xl mx-auto px-6 flex items-center justify-between border-b border-slate-200 h-16 bg-white sticky top-0 z-20"
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
    <!-- Sub-Header: Línea de Tiempo Horizontal -->
    <div
      class="w-full max-w-2xl px-2 mx-auto bg-slate-100/90 border-b border-slate-200 py-2 mb-4"
    >
      <div class="text-center">
        <span class="text-xs font-black text-slate-700 tracking-tight"
          >Línea de Tiempo</span
        >
      </div>

      <!-- Container con Scroll Horizontal -->
      <div class="flex items-center gap-2">
        <div
          class="overflow-x-auto no-scrollbar w-full h-15 px-4 flex items-center gap-2"
        >
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

        <div
          class="w-min p-2 border-l-2 border-slate-300 flex items-center justify-center"
        >
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
        <div class="flex items-center gap-2">
          <h2 class="font-black text-teal-950 text-base">
            {{
              isEditingExisting
                ? `Configurar Reto #${activeChallengeIndex + 1}`
                : "Crear Nuevo Reto"
            }}
          </h2>
          <span
            v-if="hasDraftRestored"
            class="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full"
          >
            Borrador
          </span>
        </div>

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

        <!-- Selector de Tipo de Objetivo (`target_type`: SIGN o PHRASE) -->
        <Select
          v-model="challengeForm.target_type"
          :options="targetTypeOptions"
          variant="studio"
          required
        >
          Tipo de Objetivo
        </Select>

        <!-- Buscador y Selección de Seña (`target_sign`) -->
        <div
          v-if="challengeForm.target_type === 'SIGN'"
          class="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/60 space-y-3"
        >
          <div class="flex justify-between items-center">
            <label class="font-black text-teal-900 text-sm"
              >Seña Asociada</label
            >
            <button
              type="button"
              @click="goToCreateSign"
              class="text-xs font-black text-teal-700 hover:underline cursor-pointer"
            >
              + Crear nueva seña
            </button>
          </div>

          <!-- Seña actualmente seleccionada -->
          <div
            v-if="selectedSignObj"
            class="p-2.5 rounded-xl bg-teal-50 border-2 border-teal-400 flex items-center justify-between gap-2"
          >
            <div class="min-w-0">
              <span class="text-xs font-black text-teal-950 block">
                Seleccionada: {{ selectedSignObj.gloss }}
              </span>
              <span class="text-[11px] font-bold text-teal-700 block truncate">
                {{ selectedSignObj.meaning }}
              </span>
            </div>
            <button
              type="button"
              @click="clearSelectedSign"
              class="w-7 h-7 rounded-lg bg-white border border-teal-200 text-slate-600 hover:text-red-600 flex items-center justify-center shrink-0 cursor-pointer"
              title="Quitar selección"
            >
              <FontAwesomeIcon :icon="faXmark" class="text-xs" />
            </button>
          </div>

          <Input
            v-model="signSearchQuery"
            variant="studio"
            placeholder="Buscar seña por glosa o significado..."
          />

          <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            <button
              v-for="sign in filteredSigns"
              :key="sign.id"
              type="button"
              @click="selectSign(sign)"
              :class="[
                'w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer',
                challengeForm.target_sign === sign.id
                  ? 'bg-teal-100/80 border-teal-500 text-teal-950'
                  : 'bg-white hover:bg-teal-50 border-slate-200 hover:border-teal-400',
              ]"
            >
              <div class="min-w-0">
                <span class="text-xs font-black text-teal-950 block">{{
                  sign.gloss
                }}</span>
                <span class="text-[11px] font-bold text-slate-500 block truncate">{{
                  sign.meaning
                }}</span>
              </div>
              <span
                class="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"
              >
                <FontAwesomeIcon
                  :icon="
                    challengeForm.target_sign === sign.id ? faCheck : faPlus
                  "
                  class="text-xs"
                />
              </span>
            </button>

            <p
              v-if="filteredSigns.length === 0"
              class="text-xs font-bold text-slate-400 text-center py-3"
            >
              No se encontraron señas con ese filtro.
            </p>
          </div>
        </div>

        <!-- Buscador y Selección de Frase (`target_phrase`) -->
        <div
          v-else
          class="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/60 space-y-3"
        >
          <div class="flex justify-between items-center">
            <label class="font-black text-teal-900 text-sm"
              >Frase Asociada</label
            >
            <button
              type="button"
              @click="goToCreatePhrase"
              class="text-xs font-black text-teal-700 hover:underline cursor-pointer"
            >
              + Crear nueva frase
            </button>
          </div>

          <!-- Frase actualmente seleccionada -->
          <div
            v-if="selectedPhraseObj"
            class="p-2.5 rounded-xl bg-teal-50 border-2 border-teal-400 flex items-center justify-between gap-2"
          >
            <div class="min-w-0">
              <span class="text-xs font-black text-teal-950 block truncate">
                Seleccionada:
                {{ selectedPhraseObj.sentence_meaning || selectedPhraseObj.id }}
              </span>
              <span
                v-if="selectedPhraseObj.glosses"
                class="text-[11px] font-bold text-teal-700 block truncate"
              >
                {{ selectedPhraseObj.glosses }}
              </span>
            </div>
            <button
              type="button"
              @click="clearSelectedPhrase"
              class="w-7 h-7 rounded-lg bg-white border border-teal-200 text-slate-600 hover:text-red-600 flex items-center justify-center shrink-0 cursor-pointer"
              title="Quitar selección"
            >
              <FontAwesomeIcon :icon="faXmark" class="text-xs" />
            </button>
          </div>

          <Input
            v-model="phraseSearchQuery"
            variant="studio"
            placeholder="Buscar frase por significado o glosas..."
          />

          <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            <button
              v-for="phrase in filteredPhrases"
              :key="phrase.id"
              type="button"
              @click="selectPhrase(phrase)"
              :class="[
                'w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer',
                challengeForm.target_phrase === phrase.id
                  ? 'bg-teal-100/80 border-teal-500 text-teal-950'
                  : 'bg-white hover:bg-teal-50 border-slate-200 hover:border-teal-400',
              ]"
            >
              <div class="min-w-0">
                <span class="text-xs font-black text-teal-950 block truncate">{{
                  phrase.sentence_meaning || phrase.id
                }}</span>
                <span
                  v-if="phrase.glosses"
                  class="text-[11px] font-bold text-slate-500 block truncate"
                  >{{ phrase.glosses }}</span
                >
              </div>
              <span
                class="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"
              >
                <FontAwesomeIcon
                  :icon="
                    challengeForm.target_phrase === phrase.id
                      ? faCheck
                      : faPlus
                  "
                  class="text-xs"
                />
              </span>
            </button>

            <p
              v-if="filteredPhrases.length === 0"
              class="text-xs font-bold text-slate-400 text-center py-3"
            >
              No se encontraron frases con ese filtro.
            </p>
          </div>
        </div>

        <!-- Previsualización de Seña o Frase Seleccionada -->
        <section
          v-if="
            (challengeForm.target_type === 'SIGN' && selectedSignObj) ||
            (challengeForm.target_type === 'PHRASE' && selectedPhraseObj)
          "
          class="bg-slate-50 rounded-2xl border-2 border-slate-200 p-3.5 space-y-3"
        >
          <div class="flex items-center justify-between gap-2">
            <h3
              class="font-black text-teal-950 text-xs flex items-center gap-1.5"
            >
              <FontAwesomeIcon :icon="faFilm" class="text-teal-600" />
              <span>
                {{
                  challengeForm.target_type === "SIGN"
                    ? "Previsualización de Seña"
                    : "Previsualización de Frase"
                }}
              </span>
            </h3>

            <button
              type="button"
              @click="togglePreview"
              :disabled="
                isLoadingSequence ||
                (challengeForm.target_type === 'PHRASE' &&
                  phraseSequenceSigns.length === 0 &&
                  !isLoadingSequence)
              "
              class="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <FontAwesomeIcon :icon="isPreviewPlaying ? faStop : faPlay" />
              <span>{{ isPreviewPlaying ? "Detener" : "Reproducir" }}</span>
            </button>
          </div>

          <p
            v-if="
              challengeForm.target_type === 'PHRASE' &&
              phraseSequenceSigns.length > 0
            "
            class="text-[11px] font-black text-teal-800 bg-teal-100/70 px-2.5 py-1.5 rounded-xl"
          >
            Secuencia ({{ phraseSequenceSigns.length }}):
            {{ phraseSequenceSigns.map((s) => s.gloss).join(" → ") }}
          </p>

          <p
            v-else-if="
              challengeForm.target_type === 'PHRASE' && !isLoadingSequence
            "
            class="text-[11px] font-bold text-slate-500"
          >
            Esta frase no tiene señas registradas en su orquestación.
          </p>

          <div v-if="isPreviewPlaying" class="flex flex-col items-center gap-2">
            <div
              class="relative w-48 aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border-2 border-teal-500"
            >
              <video
                v-if="activePreviewVideoUrl"
                ref="previewVideoEl"
                :key="activePreviewVideoUrl + '_' + currentSequenceIndex"
                :src="activePreviewVideoUrl"
                autoplay
                playsinline
                @ended="onPreviewVideoEnded"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center p-3 text-center text-xs font-bold text-slate-300"
              >
                Sin video disponible
              </div>

              <div
                class="absolute bottom-2 inset-x-2 bg-slate-950/85 text-white text-center py-1 px-2 rounded-xl text-[11px] font-black"
              >
                <span v-if="challengeForm.target_type === 'PHRASE'">
                  {{ currentSequenceIndex + 1 }} /
                  {{ phraseSequenceSigns.length }} •
                </span>
                {{ activePreviewSign?.gloss }}
              </div>
            </div>
          </div>
        </section>

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
  </main>
</template>