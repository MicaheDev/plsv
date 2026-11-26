<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import pb from "@/services/pb";
import {
  faArrowLeft,
  faPlus,
  faPlay,
  faRotateRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { emotionOptions, getEmotionLabel } from "@/utilities/selects";

const router = useRouter();

const phrases = ref([]);
const isLoading = ref(true);
const searchQuery = ref("");

// Estado del BottomSheet y reproducción encadenada
const isSheetOpen = ref(false);
const selectedPhrase = ref(null);
const sequenceSigns = ref([]);
const isLoadingSequence = ref(false);
const currentStepIndex = ref(0);
const isSequencePlaying = ref(false);
const sequenceVideoEl = ref(null);

const fetchPhrases = async () => {
  isLoading.value = true;
  try {
    phrases.value = await pb.collection("phrases").getFullList({
      sort: "-created",
    });
  } catch (err) {
    console.error("Error al cargar frases:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPhrases();
});

const filteredPhrases = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return phrases.value;
  return phrases.value.filter(
    (p) =>
      p.sentence_meaning?.toLowerCase().includes(q) ||
      p.glosses?.toLowerCase().includes(q) ||
      p.emotion?.toLowerCase().includes(q),
  );
});

const activeStepSign = computed(
  () => sequenceSigns.value[currentStepIndex.value] || null,
);

const activeStepVideoUrl = computed(() => {
  const sign = activeStepSign.value;
  if (!sign || !sign.video) return "";
  return pb.files.getURL(sign, sign.video);
});

const openPhraseSheet = async (phrase) => {
  selectedPhrase.value = phrase;
  sequenceSigns.value = [];
  currentStepIndex.value = 0;
  isSequencePlaying.value = false;
  isSheetOpen.value = true;
  isLoadingSequence.value = true;

  try {
    const records = await pb.collection("phrases_orchestration").getFullList({
      filter: `phrase = "${phrase.id}"`,
      sort: "position",
      expand: "sign",
    });
    sequenceSigns.value = records
      .map((r) => r.expand?.sign)
      .filter(Boolean);

    if (sequenceSigns.value.length > 0) {
      isSequencePlaying.value = true;
    }
  } catch (err) {
    console.error("Error al cargar secuencia de la frase:", err);
  } finally {
    isLoadingSequence.value = false;
  }
};

const replaySequence = () => {
  if (sequenceSigns.value.length === 0) return;
  currentStepIndex.value = 0;
  isSequencePlaying.value = true;
};

const onSequenceVideoEnded = () => {
  if (currentStepIndex.value + 1 < sequenceSigns.value.length) {
    currentStepIndex.value += 1;
  } else {
    isSequencePlaying.value = false;
  }
};

watch(isSheetOpen, (open) => {
  if (!open) {
    isSequencePlaying.value = false;
    currentStepIndex.value = 0;
    if (sequenceVideoEl.value) {
      sequenceVideoEl.value.pause();
    }
  }
});

const deletePhrase = async (phrase) => {
  if (!phrase?.id) return;
  if (!confirm(`¿Eliminar la frase "${phrase.sentence_meaning}"?`)) return;

  try {
    await pb.collection("phrases").delete(phrase.id);
    isSheetOpen.value = false;
    selectedPhrase.value = null;
    await fetchPhrases();
  } catch (err) {
    console.error("Error al eliminar frase:", err);
    alert("No se pudo eliminar la frase.");
  }
};
</script>

<template>
  <header
    class="w-full max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 h-16 bg-white sticky top-0 z-20"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="router.push('/studio/route')"
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
      >
        <FontAwesomeIcon :icon="faArrowLeft" />
      </button>
      <div>
        <span class="text-[10px] font-black text-teal-600 uppercase"
          >Studio • Oraciones</span
        >
        <h1 class="font-black text-sm text-teal-950">
          Frases ({{ phrases.length }})
        </h1>
      </div>
    </div>

    <Button
      type="button"
      variant="studio"
      class="!py-2 !px-3.5 text-xs flex items-center gap-1.5"
      @click="
        router.push({
          path: '/studio/phrases/new',
          query: { returnTo: '/studio/phrases' },
        })
      "
    >
      <FontAwesomeIcon :icon="faPlus" />
      <span>Nueva Frase</span>
    </Button>
  </header>

  <main
    class="w-full overflow-y-auto max-w-2xl mx-auto h-full pb-24 p-4 space-y-4"
  >
    <!-- Buscador -->
    <div class="bg-white p-3.5 rounded-3xl border-2 border-slate-200">
      <Input
        v-model="searchQuery"
        variant="studio"
        placeholder="Buscar por significado, glosas o emoción..."
      />
    </div>

    <!-- Cargando -->
    <div
      v-if="isLoading"
      class="text-center py-12 text-xs font-black text-slate-400"
    >
      Cargando frases...
    </div>

    <!-- Lista en 1 sola columna -->
    <div v-else-if="filteredPhrases.length > 0" class="flex flex-col gap-3">
      <article
        v-for="phrase in filteredPhrases"
        :key="phrase.id"
        @click="openPhraseSheet(phrase)"
        class="w-full bg-white rounded-3xl border-2 border-slate-200 hover:border-teal-500 p-4 shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
      >
        <div class="min-w-0 space-y-1.5">
          <div class="flex items-center gap-2">
            <span
              v-if="phrase.emotion"
              class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
            >
                 {{ getEmotionLabel(phrase.emotion) }}

            </span>
          </div>

          <h2 class="font-black text-sm sm:text-base text-teal-950">
            {{ phrase.sentence_meaning }}
          </h2>

          <p
            v-if="phrase.glosses"
            class="text-xs font-black text-teal-700 tracking-wide"
          >
            {{ phrase.glosses }}
          </p>
        </div>

        <span
          class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0"
          title="Reproducir secuencia"
        >
          <FontAwesomeIcon :icon="faPlay" class="text-xs" />
        </span>
      </article>
    </div>

    <div
      v-else
      class="bg-white rounded-3xl border-2 border-slate-200 p-8 text-center space-y-2"
    >
      <p class="text-sm font-black text-slate-600">
        No se encontraron frases.
      </p>
      <p class="text-xs font-bold text-slate-400">
        Crea una nueva frase desde el orquestador.
      </p>
    </div>
  </main>

  <!-- BottomSheet reproduciendo la secuencia -->
  <BottomSheet
    v-model="isSheetOpen"
    :title="selectedPhrase?.sentence_meaning || 'Secuencia de Frase'"
  >
    <div v-if="selectedPhrase" class="space-y-4">
      <div
        v-if="isLoadingSequence"
        class="py-12 text-center text-xs font-black text-slate-400"
      >
        Cargando secuencia de señas...
      </div>

      <template v-else-if="sequenceSigns.length > 0">
        <!-- Reproductor secuencial 9:16 -->
        <div class="flex flex-col items-center gap-2">
          <div
            class="relative w-60 sm:w-64 aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border-2 border-teal-500"
          >
            <video
              v-if="activeStepVideoUrl"
              ref="sequenceVideoEl"
              :key="activeStepVideoUrl + '_' + currentStepIndex"
              :src="activeStepVideoUrl"
              :autoplay="isSequencePlaying"
              playsinline
              @ended="onSequenceVideoEnded"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center p-4 text-center text-xs font-bold text-slate-400"
            >
              Sin video en esta seña
            </div>

            <div
              class="absolute bottom-2 inset-x-2 bg-slate-950/85 text-white text-center py-1.5 px-2 rounded-xl text-xs font-black"
            >
              {{ currentStepIndex + 1 }} / {{ sequenceSigns.length }} •
              {{ activeStepSign?.gloss }}
            </div>
          </div>

          <button
            type="button"
            @click="replaySequence"
            class="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <FontAwesomeIcon :icon="faRotateRight" />
            <span>Reproducir secuencia completa</span>
          </button>
        </div>

        <!-- Píldoras de progreso por glosa -->
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <button
            v-for="(s, idx) in sequenceSigns"
            :key="s.id + '_' + idx"
            type="button"
            @click="
              currentStepIndex = idx;
              isSequencePlaying = true;
            "
            :class="[
              'px-2.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer',
              currentStepIndex === idx
                ? 'bg-teal-600 text-white border-teal-700'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-teal-400',
            ]"
          >
            {{ idx + 1 }}. {{ s.gloss }}
          </button>
        </div>
      </template>

      <p
        v-else
        class="text-center py-8 text-xs font-bold text-slate-400"
      >
        Esta frase no tiene señas registradas en su secuencia.
      </p>

      <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
        <span
          v-if="selectedPhrase.emotion"
          class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 inline-block"
        >
          {{ getEmotionLabel(selectedPhrase.emotion) }}
        </span>
        <p class="text-sm font-black text-teal-950">
          {{ selectedPhrase.sentence_meaning }}
        </p>
        <p v-if="selectedPhrase.glosses" class="text-xs font-bold text-teal-700">
          {{ selectedPhrase.glosses }}
        </p>
      </div>

      <button
        type="button"
        @click="deletePhrase(selectedPhrase)"
        class="w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
      >
        <FontAwesomeIcon :icon="faTrash" />
        <span>Eliminar Frase</span>
      </button>
    </div>
  </BottomSheet>
</template>