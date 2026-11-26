<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import pb from "@/services/pb";
import {
  faArrowLeft,
  faCheckCircle,
  faHeart,
  faHeartCrack,
  faHands,
  faPlay,
  faRotateRight,
  faGem,
  faStar,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useGamifiedStats } from "@/stores/gamifiedStats";

const { fetchGamifiedStats, loseHeart, rewardLessonCompletion } =
  useGamifiedStats();

const route = useRoute();
const router = useRouter();
const lessonId = route.params.id;

const lesson = ref(null);
const challenges = ref([]);
const isLoading = ref(true);
const currentStep = ref(0);

// Vidas de la lección (3 por defecto) y estado de derrota/victoria
const lessonLives = ref(3);
const isFailedLesson = ref(false);
const isCompletedLesson = ref(false);
const isSavingProgress = ref(false);

// Estado interactivo del reto actual
const selectedOption = ref("");
const failedOption = ref("");
const shuffledOptions = ref([]);
const feedbackState = ref(null); // null | "correct" | "incorrect" | "info"
const feedbackMessage = ref("");

// Secuencia de señas cuando el objetivo del reto es una PHRASE
const targetPhraseSigns = ref([]);
const phrasePlayIndex = ref(0);
const isPhrasePlaying = ref(false);

// BottomSheet para ver video de seña/frase o guía del enunciado
const isMediaSheetOpen = ref(false);
const mediaSheetTitle = ref("");
const mediaSheetSigns = ref([]);
const sheetPlayIndex = ref(0);
const sheetVideoEl = ref(null);

const currentChallenge = computed(
  () => challenges.value[currentStep.value] || null,
);

const progressPercent = computed(() => {
  if (challenges.value.length === 0) return 0;
  if (isCompletedLesson.value) return 100;
  return Math.round((currentStep.value / challenges.value.length) * 100);
});

const parsedConfig = computed(() => {
  const raw = currentChallenge.value?.challenge_config;
  if (!raw) return { options: [], correct_answer: "" };
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      options: Array.isArray(data.options)
        ? data.options.filter((o) => String(o).trim() !== "")
        : [],
      correct_answer: data.correct_answer
        ? String(data.correct_answer).trim()
        : "",
    };
  } catch {
    return { options: [], correct_answer: "" };
  }
});

// Mezcla aleatoria (Fisher-Yates) incluyendo `correct_answer` + `options`
const buildShuffledOptions = () => {
  const { options, correct_answer } = parsedConfig.value;
  const combined = [...options];

  if (
    correct_answer &&
    !combined.some(
      (item) =>
        String(item).trim().toLowerCase() === correct_answer.toLowerCase(),
    )
  ) {
    combined.push(correct_answer);
  }

  const arr = [...combined];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  shuffledOptions.value = arr;
};

const targetSignObj = computed(() => {
  if (currentChallenge.value?.target_type !== "SIGN") return null;
  return currentChallenge.value?.expand?.target_sign || null;
});

const targetPhraseObj = computed(() => {
  if (currentChallenge.value?.target_type !== "PHRASE") return null;
  return currentChallenge.value?.expand?.target_phrase || null;
});

const getRepresentationImageUrl = (sign) => {
  if (!sign?.representation_image) return "";
  return pb.files.getURL(sign, sign.representation_image);
};

const getVideoUrl = (sign) => {
  if (!sign?.video) return "";
  return pb.files.getURL(sign, sign.video);
};

const loadPhraseSigns = async (phraseId) => {
  if (!phraseId) return [];
  const rows = await pb.collection("phrases_orchestration").getFullList({
    filter: `phrase = "${phraseId}"`,
    sort: "position",
    expand: "sign",
  });
  return rows.map((r) => r.expand?.sign).filter(Boolean);
};

const setupChallengeState = async () => {
  selectedOption.value = "";
  failedOption.value = "";
  feedbackState.value = null;
  feedbackMessage.value = "";
  targetPhraseSigns.value = [];
  phrasePlayIndex.value = 0;
  isPhrasePlaying.value = false;

  buildShuffledOptions();

  const ch = currentChallenge.value;
  if (!ch) return;

  if (ch.target_type === "PHRASE" && ch.target_phrase) {
    targetPhraseSigns.value = await loadPhraseSigns(ch.target_phrase);
    if (targetPhraseSigns.value.length > 0) {
      isPhrasePlaying.value = true;
    }
  }
};

const fetchLessonAndChallenges = async () => {
  isLoading.value = true;
  try {
    lesson.value = await pb.collection("lessons").getOne(lessonId);

    const records = await pb.collection("challenges").getFullList({
      filter: `lesson_id = "${lessonId}"`,
      sort: "position",
      expand: "target_sign,target_phrase",
    });

    const supportedTypes = ["DEMO", "QUIZ_MULTIPLE", "REVERSE_QUIZ"];
    challenges.value = records.filter((r) =>
      supportedTypes.includes(r.challenge_type),
    );

    currentStep.value = 0;
    lessonLives.value = 3;
    isFailedLesson.value = false;
    isCompletedLesson.value = false;

    if (challenges.value.length > 0) {
      await setupChallengeState();
    }
  } catch (error) {
    console.error("Error al cargar la lección del aprendiz:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchGamifiedStats();
  fetchLessonAndChallenges();
});

watch(currentStep, async () => {
  if (!isCompletedLesson.value && !isFailedLesson.value) {
    await setupChallengeState();
  }
});

const activePhraseSign = computed(
  () => targetPhraseSigns.value[phrasePlayIndex.value] || null,
);

const onPhraseVideoEnded = () => {
  if (phrasePlayIndex.value + 1 < targetPhraseSigns.value.length) {
    phrasePlayIndex.value += 1;
  } else {
    isPhrasePlaying.value = false;
  }
};

const replayTargetPhrase = () => {
  if (targetPhraseSigns.value.length === 0) return;
  phrasePlayIndex.value = 0;
  isPhrasePlaying.value = true;
};

const openTargetMediaSheet = async () => {
  const ch = currentChallenge.value;
  if (!ch) return;

  if (ch.target_type === "SIGN" && targetSignObj.value) {
    mediaSheetTitle.value = `${targetSignObj.value.gloss} — ${targetSignObj.value.meaning}`;
    mediaSheetSigns.value = [targetSignObj.value];
    sheetPlayIndex.value = 0;
    isMediaSheetOpen.value = true;
  } else if (ch.target_type === "PHRASE" && ch.target_phrase) {
    const seq =
      targetPhraseSigns.value.length > 0
        ? targetPhraseSigns.value
        : await loadPhraseSigns(ch.target_phrase);
    mediaSheetTitle.value =
      targetPhraseObj.value?.sentence_meaning || "Secuencia en LSV";
    mediaSheetSigns.value = seq;
    sheetPlayIndex.value = 0;
    isMediaSheetOpen.value = true;
  }
};

const openSentenceHelpSheet = async () => {
  const ch = currentChallenge.value;
  if (!ch) return;

  mediaSheetTitle.value = ch.sentence || "Guía en Lengua de Señas";

  if (ch.target_type === "SIGN" && targetSignObj.value) {
    mediaSheetSigns.value = [targetSignObj.value];
  } else if (ch.target_type === "PHRASE" && ch.target_phrase) {
    mediaSheetSigns.value =
      targetPhraseSigns.value.length > 0
        ? targetPhraseSigns.value
        : await loadPhraseSigns(ch.target_phrase);
  } else {
    mediaSheetSigns.value = [];
  }

  sheetPlayIndex.value = 0;
  isMediaSheetOpen.value = true;
};

const activeSheetSign = computed(
  () => mediaSheetSigns.value[sheetPlayIndex.value] || null,
);

const onSheetVideoEnded = () => {
  if (sheetPlayIndex.value + 1 < mediaSheetSigns.value.length) {
    sheetPlayIndex.value += 1;
  }
};

watch(isMediaSheetOpen, (open) => {
  if (!open && sheetVideoEl.value) {
    sheetVideoEl.value.pause();
  }
});

const checkChallengeAnswer = async () => {
  const ch = currentChallenge.value;
  if (!ch) return;

  if (ch.challenge_type === "DEMO") {
    feedbackState.value = "correct";
    feedbackMessage.value = "¡Demostración completada!";
    return;
  }

  if (
    ch.challenge_type === "QUIZ_MULTIPLE" ||
    ch.challenge_type === "REVERSE_QUIZ"
  ) {
    if (!selectedOption.value) {
      feedbackState.value = "info";
      feedbackMessage.value = "Selecciona una opción antes de comprobar.";
      return;
    }

    const expected = parsedConfig.value.correct_answer.toLowerCase();
    const chosen = selectedOption.value.trim().toLowerCase();

    if (expected && chosen === expected) {
      failedOption.value = "";
      feedbackState.value = "correct";
      feedbackMessage.value = "¡Muy bien! Respuesta correcta.";
    } else {
      failedOption.value = selectedOption.value;
      lessonLives.value = Math.max(0, lessonLives.value - 1);
      feedbackState.value = "incorrect";
      feedbackMessage.value = parsedConfig.value.correct_answer
        ? `Respuesta incorrecta. La opción correcta es: "${parsedConfig.value.correct_answer}".`
        : "Respuesta incorrecta. Inténtalo de nuevo.";

      if (lessonLives.value <= 0) {
        isFailedLesson.value = true;
        await loseHeart(1);
      }
    }
  }
};

const saveLessonProgress = async () => {
  const userId = pb.authStore.record?.id || pb.authStore.model?.id;
  if (!userId || !lessonId) return;

  isSavingProgress.value = true;
  try {
    const existing = await pb.collection("user_progress").getFullList({
      filter: `user = "${userId}" && lesson = "${lessonId}"`,
    });

    if (existing.length === 0) {
      await pb.collection("user_progress").create({
        user: userId,
        lesson: lessonId,
      });
    }

    await rewardLessonCompletion({
      xpGain: lesson.value?.xp_reward ?? 10,
      gemsGain: lesson.value?.gems_reward ?? 5,
    });
  } catch (err) {
    console.error("Error al guardar progreso o recompensas:", err);
  } finally {
    isSavingProgress.value = false;
  }
};

const handleContinue = async () => {
  if (isFailedLesson.value) return;

  if (!feedbackState.value || feedbackState.value === "info") {
    await checkChallengeAnswer();
    return;
  }

  if (feedbackState.value === "incorrect") {
    feedbackState.value = null;
    feedbackMessage.value = "";
    selectedOption.value = "";
    return;
  }

  if (currentStep.value + 1 < challenges.value.length) {
    currentStep.value += 1;
  } else {
    isCompletedLesson.value = true;
    await saveLessonProgress();
  }
};

const retryLesson = async () => {
  await fetchLessonAndChallenges();
};
</script>

<template>
  <header
    class="w-full max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-200 h-16 bg-white sticky top-0 z-20"
  >
    <button
      type="button"
      @click="router.push('/learning')"
      class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 cursor-pointer"
    >
      <FontAwesomeIcon :icon="faArrowLeft" />
    </button>

    <!-- Barra de progreso de la lección -->
    <div class="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
      <div
        class="h-full bg-blue-500 transition-all duration-300 rounded-full"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- Vidas de la lección (3 vidas) -->
    <div
      class="px-2.5 py-1 rounded-xl bg-red-50 border border-red-200 flex items-center gap-1.5 text-xs font-black text-red-600 shrink-0"
      title="Vidas restantes en la lección"
    >
      <FontAwesomeIcon :icon="faHeart" />
      <span>{{ lessonLives }}/3</span>
    </div>
  </header>

  <main
    class="w-full max-w-2xl mx-auto min-h-[calc(100svh-4rem)] pb-28 p-4 flex flex-col justify-between bg-white"
  >
    <div
      v-if="isLoading"
      class="py-16 text-center text-xs font-black text-slate-400"
    >
      Cargando lección...
    </div>

    <!-- Pantalla de Lección Fallida (0 vidas de 3) -->
    <section
      v-else-if="isFailedLesson"
      class="my-auto bg-red-50/70 border-2 border-red-200 rounded-3xl p-6 text-center space-y-5"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-red-500 text-white mx-auto flex items-center justify-center shadow-md"
      >
        <FontAwesomeIcon :icon="faHeartCrack" class="text-3xl" />
      </div>

      <div class="space-y-1">
        <span class="text-xs font-black text-red-600 uppercase"
          >Sin vidas en la lección</span
        >
        <h1 class="font-black text-xl text-slate-900">
          ¡Has fallado esta lección!
        </h1>
        <p class="text-xs font-bold text-slate-600">
          Perdiste tus 3 vidas de la lección y se descontó 1 vida de tus
          estadísticas generales.
        </p>
      </div>

      <div class="space-y-2.5">
        <Button
          type="button"
          variant="primary"
          class="w-full"
          @click="retryLesson"
        >
          Reintentar lección
        </Button>
        <button
          type="button"
          @click="router.push('/learning')"
          class="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-xs font-black text-slate-700 cursor-pointer"
        >
          Volver a la ruta
        </button>
      </div>
    </section>

    <!-- Pantalla Final de Lección Completada -->
    <section
      v-else-if="isCompletedLesson"
      class="my-auto bg-blue-50/60 border-2 border-blue-200 rounded-3xl p-6 text-center space-y-5"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-blue-500 text-white mx-auto flex items-center justify-center shadow-md"
      >
        <FontAwesomeIcon :icon="faCheckCircle" class="text-3xl" />
      </div>

      <div class="space-y-1">
        <span class="text-xs font-black text-blue-600 uppercase"
          >¡Lección Completada!</span
        >
        <h1 class="font-black text-xl text-blue-950">
          {{ lesson?.title }}
        </h1>
        <p class="text-xs font-bold text-slate-600">
          Has completado todos los retos y desbloqueado el siguiente paso.
        </p>
      </div>

      <div class="flex items-center justify-center gap-3">
        <div
          class="px-4 py-2 rounded-2xl bg-white border-2 border-amber-200 flex items-center gap-2 text-xs font-black text-amber-800"
        >
          <FontAwesomeIcon :icon="faStar" class="text-yellow-500" />
          <span>+{{ lesson?.xp_reward ?? 10 }} XP</span>
        </div>
        <div
          class="px-4 py-2 rounded-2xl bg-white border-2 border-blue-200 flex items-center gap-2 text-xs font-black text-blue-800"
        >
          <FontAwesomeIcon :icon="faGem" class="text-blue-500" />
          <span>+{{ lesson?.gems_reward ?? 5 }} Gemas</span>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        class="w-full"
        :disabled="isSavingProgress"
        @click="router.push('/learning')"
      >
        {{ isSavingProgress ? "Guardando progreso..." : "Volver a la Ruta" }}
      </Button>
    </section>

    <!-- Sin retos configurados -->
    <section
      v-else-if="!currentChallenge"
      class="my-auto text-center py-12 space-y-3"
    >
      <p class="text-sm font-black text-slate-700">
        Esta lección aún no tiene retos publicados.
      </p>
      <Button type="button" variant="primary" @click="router.push('/learning')">
        Volver a la Ruta
      </Button>
    </section>

    <!-- Reto Activo -->
    <template v-else>
      <div class="space-y-5">
        <!-- Enunciado clicable -->
        <button
          type="button"
          @click="openSentenceHelpSheet"
          class="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border-2 border-slate-200 hover:border-blue-400 transition-all flex items-start justify-between gap-3 cursor-pointer"
          title="Toca para ver apoyo en lengua de señas"
        >
          <div class="space-y-0.5">
            <span
              class="text-[10px] font-black uppercase tracking-wider text-blue-600 block"
            >
              {{ currentChallenge.challenge_type }} • Toca para ver en señas
            </span>
            <p class="font-black text-base text-blue-950 leading-snug">
              {{ currentChallenge.sentence || "Observa y completa el reto" }}
            </p>
          </div>
          <span
            class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5"
          >
            <FontAwesomeIcon :icon="faCircleQuestion" class="text-sm" />
          </span>
        </button>

        <!-- Caso 1: Objetivo es una SEÑA (SIGN) -->
        <section
          v-if="currentChallenge.target_type === 'SIGN' && targetSignObj"
          class="bg-white rounded-3xl border-2 border-slate-200 p-4 flex flex-col items-center gap-3"
        >
          <div
            v-if="
              currentChallenge.challenge_type === 'DEMO' ||
              currentChallenge.challenge_type === 'REVERSE_QUIZ'
            "
            class="w-full flex flex-col items-center gap-3"
          >
            <div
              @click="openTargetMediaSheet"
              class="w-52 aspect-square rounded-3xl bg-slate-100 border-2 border-slate-200 hover:border-blue-500 overflow-hidden flex items-center justify-center cursor-pointer transition-all"
            >
              <img
                v-if="getRepresentationImageUrl(targetSignObj)"
                :src="getRepresentationImageUrl(targetSignObj)"
                :alt="targetSignObj.meaning"
                class="w-full h-full object-cover"
              />
              <FontAwesomeIcon
                v-else
                :icon="faHands"
                class="text-4xl text-blue-600/50"
              />
            </div>

            <button
              type="button"
              @click="openTargetMediaSheet"
              class="px-4 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 text-blue-900 text-sm font-black flex items-center gap-2 cursor-pointer"
            >
              <FontAwesomeIcon :icon="faPlay" class="text-xs text-blue-600" />
              <span>{{ targetSignObj.meaning }}</span>
            </button>
          </div>

          <div v-else class="w-full flex flex-col items-center gap-2.5">
            <div
              class="w-56 aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-300"
            >
              <video
                v-if="getVideoUrl(targetSignObj)"
                :key="targetSignObj.id + '_' + currentStep"
                :src="getVideoUrl(targetSignObj)"
                controls
                autoplay
                loop
                playsinline
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center p-4 text-center text-xs font-bold text-slate-400"
              >
                Video no disponible
              </div>
            </div>
            <span class="text-xs font-black text-blue-800">
              {{ targetSignObj.gloss }}
            </span>
          </div>
        </section>

        <!-- Caso 2: Objetivo es una FRASE (PHRASE) -->
        <section
          v-else-if="currentChallenge.target_type === 'PHRASE'"
          class="bg-white rounded-3xl border-2 border-slate-200 p-4 flex flex-col items-center gap-3"
        >
          <div
            class="w-56 aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border-2 border-blue-500 relative"
          >
            <video
              v-if="activePhraseSign && getVideoUrl(activePhraseSign)"
              :key="activePhraseSign.id + '_' + phrasePlayIndex"
              :src="getVideoUrl(activePhraseSign)"
              :autoplay="isPhrasePlaying"
              playsinline
              @ended="onPhraseVideoEnded"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center p-4 text-center text-xs font-bold text-slate-400"
            >
              Cargando secuencia de frase...
            </div>

            <div
              v-if="targetPhraseSigns.length > 0"
              class="absolute bottom-2 inset-x-2 bg-slate-950/85 text-white text-center py-1 px-2 rounded-xl text-[11px] font-black"
            >
              {{ phrasePlayIndex + 1 }} / {{ targetPhraseSigns.length }} •
              {{ activePhraseSign?.gloss }}
            </div>
          </div>

          <button
            v-if="targetPhraseSigns.length > 0"
            type="button"
            @click="replayTargetPhrase"
            class="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <FontAwesomeIcon :icon="faRotateRight" class="text-xs" />
            <span>Repetir frase</span>
          </button>

          <p
            v-if="
              currentChallenge.challenge_type === 'DEMO' &&
              targetPhraseObj?.sentence_meaning
            "
            class="text-sm font-black text-blue-950 text-center"
          >
            {{ targetPhraseObj.sentence_meaning }}
          </p>
        </section>

        <!-- Opciones mezcladas aleatoriamente para QUIZ_MULTIPLE y REVERSE_QUIZ -->
        <div
          v-if="
            (currentChallenge.challenge_type === 'QUIZ_MULTIPLE' ||
              currentChallenge.challenge_type === 'REVERSE_QUIZ') &&
            shuffledOptions.length > 0
          "
          class="grid grid-cols-1 gap-2.5"
        >
          <button
            v-for="(opt, idx) in shuffledOptions"
            :key="idx + '_' + opt"
            type="button"
            :disabled="Boolean(feedbackState)"
            @click="selectedOption = opt"
            :class="[
              'w-full p-3.5 rounded-2xl border-2 text-left text-sm font-black transition-all cursor-pointer',
              feedbackState === 'incorrect' && failedOption === opt
                ? 'bg-red-500 text-white border-red-600'
                : feedbackState === 'incorrect' &&
                    parsedConfig.correct_answer &&
                    opt.trim().toLowerCase() ===
                      parsedConfig.correct_answer.toLowerCase()
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : selectedOption === opt
                    ? 'bg-blue-500 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400',
            ]"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <!-- Pie inferior: Feedback y botón principal -->
      <div class="pt-6 space-y-3">
        <div
          v-if="feedbackMessage"
          :class="[
            'p-3 rounded-2xl border-2 text-xs font-black',
            feedbackState === 'correct'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : feedbackState === 'incorrect'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-amber-50 border-amber-300 text-amber-800',
          ]"
        >
          {{ feedbackMessage }}
        </div>

        <Button
          type="button"
          variant="primary"
          class="w-full"
          @click="handleContinue"
        >
          {{
            !feedbackState || feedbackState === "info"
              ? "Comprobar"
              : feedbackState === "incorrect"
                ? "Reintentar"
                : currentStep + 1 < challenges.length
                  ? "Siguiente reto"
                  : "Finalizar lección"
          }}
        </Button>
      </div>
    </template>
  </main>

  <!-- BottomSheet para reproducir video de seña, frase o guía en señas del enunciado -->
  <BottomSheet v-model="isMediaSheetOpen" :title="mediaSheetTitle">
    <div class="space-y-4">
      <div
        v-if="mediaSheetSigns.length > 0"
        class="flex flex-col items-center gap-3"
      >
        <div
          class="w-60 sm:w-64 aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-300 relative"
        >
          <video
            v-if="activeSheetSign && getVideoUrl(activeSheetSign)"
            ref="sheetVideoEl"
            :key="activeSheetSign.id + '_' + sheetPlayIndex"
            :src="getVideoUrl(activeSheetSign)"
            controls
            autoplay
            playsinline
            @ended="onSheetVideoEnded"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center p-4 text-center text-xs font-bold text-slate-400"
          >
            Sin video disponible
          </div>

          <div
            v-if="mediaSheetSigns.length > 1"
            class="absolute bottom-2 inset-x-2 bg-slate-950/85 text-white text-center py-1 px-2 rounded-xl text-xs font-black"
          >
            {{ sheetPlayIndex + 1 }} / {{ mediaSheetSigns.length }} •
            {{ activeSheetSign?.gloss }}
          </div>
        </div>

        <div
          v-if="mediaSheetSigns.length > 1"
          class="flex flex-wrap justify-center gap-1.5"
        >
          <button
            v-for="(s, idx) in mediaSheetSigns"
            :key="s.id + '_' + idx"
            type="button"
            @click="sheetPlayIndex = idx"
            :class="[
              'px-2.5 py-1 rounded-xl text-xs font-black border cursor-pointer',
              sheetPlayIndex === idx
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-slate-100 text-slate-600 border-slate-200',
            ]"
          >
            {{ idx + 1 }}. {{ s.gloss }}
          </button>
        </div>
      </div>

      <p v-else class="text-center py-8 text-xs font-bold text-slate-500">
        No hay señas de apoyo asociadas a este enunciado todavía.
      </p>
    </div>
  </BottomSheet>
</template>