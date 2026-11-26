<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import pb from "@/services/pb";
import {
  faArrowLeft,
  faPlus,
  faTrash,
  faArrowUp,
  faArrowDown,
  faPlay,
  faStop,
  faFilm,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { emotionOptions } from "@/utilities/selects";

const route = useRoute();
const router = useRouter();

const NEW_PHRASE_KEY = "studio_newly_created_phrase_id";

const signsCatalog = ref([]);
const searchQuery = ref("");
const selectedSequence = ref([]); // Orden gramatical de señas

const phraseForm = ref({
  sentence_meaning: "",
  emotion: "NEUTRAL",
});

const isSaving = ref(false);
const errorMessage = ref("");

// Estado de reproducción encadenada
const isPlaying = ref(false);
const currentIndex = ref(0);
const playerEl = ref(null);

const filteredSigns = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return signsCatalog.value;
  return signsCatalog.value.filter(
    (s) =>
      s.gloss?.toLowerCase().includes(q) ||
      s.meaning?.toLowerCase().includes(q),
  );
});

const glossSequenceText = computed(() =>
  selectedSequence.value.map((s) => s.gloss).join(" → "),
);

const activeSign = computed(
  () => selectedSequence.value[currentIndex.value] || null,
);

const activeVideoUrl = computed(() => {
  const sign = activeSign.value;
  if (!sign || !sign.video) return "";
  return pb.files.getURL(sign, sign.video);
});

onMounted(async () => {
  try {
    signsCatalog.value = await pb.collection("signs").getFullList({
      sort: "gloss",
    });
  } catch (err) {
    console.error("Error al cargar señas:", err);
    errorMessage.value = "No se pudo cargar el diccionario de señas.";
  }
});

const addSign = (sign) => {
  selectedSequence.value.push({ ...sign });
};

const removeSign = (idx) => {
  stopPreview();
  selectedSequence.value.splice(idx, 1);
};

const moveSign = (idx, delta) => {
  const target = idx + delta;
  if (target < 0 || target >= selectedSequence.value.length) return;
  const copy = [...selectedSequence.value];
  const [item] = copy.splice(idx, 1);
  copy.splice(target, 0, item);
  selectedSequence.value = copy;
};

const startPreview = () => {
  if (selectedSequence.value.length === 0) return;
  currentIndex.value = 0;
  isPlaying.value = true;
};

const stopPreview = () => {
  isPlaying.value = false;
  currentIndex.value = 0;
  if (playerEl.value) playerEl.value.pause();
};

const handleVideoEnded = () => {
  if (currentIndex.value + 1 < selectedSequence.value.length) {
    currentIndex.value += 1;
  } else {
    isPlaying.value = false;
    currentIndex.value = 0;
  }
};

const handleSavePhrase = async () => {
  if (selectedSequence.value.length === 0) {
    errorMessage.value = "Añade al menos una seña para orquestar la frase.";
    return;
  }

  if (!phraseForm.value.sentence_meaning.trim()) {
    errorMessage.value = "Escribe el significado de la frase.";
    return;
  }

  isSaving.value = true;
  errorMessage.value = "";

  let createdPhrase = null;

  try {

    const glossesSequence = selectedSequence.value
      .map((sign) => sign.gloss?.trim())
      .filter(Boolean)
      .join(" ");
    // 1. Crear registro principal en `phrases`
    createdPhrase = await pb.collection("phrases").create({
      sentence_meaning: phraseForm.value.sentence_meaning.trim(),
glosses: glossesSequence,
      emotion: phraseForm.value.emotion || "NEUTRAL",
    });

    // 2. Guardar cada seña en orden en la tabla intermediaria `phrases_orchestration`
    for (let i = 0; i < selectedSequence.value.length; i++) {
      const sign = selectedSequence.value[i];
      await pb.collection("phrases_orchestration").create({
        phrase: createdPhrase.id,
        sign: sign.id,
        position: i + 1,
      });
    }

    sessionStorage.setItem(NEW_PHRASE_KEY, createdPhrase.id);
    const returnTo = route.query.returnTo || "/studio/route";
    router.push(returnTo);
  } catch (err) {
    console.error("Error al guardar la frase y su orquestación:", err);

    // Rollback básico si se creó la frase pero falló algún ítem de `phrases_orchestration`
    if (createdPhrase?.id) {
      await pb.collection("phrases").delete(createdPhrase.id).catch(() => {});
    }

    errorMessage.value =
      err?.data?.message ||
      err?.message ||
      "No se pudo guardar la frase o su secuencia en PocketBase.";
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  const returnTo = route.query.returnTo || "/studio/route";
  router.push(returnTo);
};
</script>

<template>
  <header
    class="w-full max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 h-16 bg-white sticky top-0 z-20"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="handleCancel"
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
      >
        <FontAwesomeIcon :icon="faArrowLeft" />
      </button>
      <div>
        <span class="text-[10px] font-black text-teal-600 uppercase"
          >Studio • Orquestador</span
        >
        <h1 class="font-black text-sm text-teal-950">Orquestador de Frases</h1>
      </div>
    </div>
  </header>

  <main
    class="w-full overflow-y-auto max-w-2xl mx-auto h-full pb-28 p-4 space-y-4"
  >
    <!-- Reproductor Encadenado de la Secuencia -->
    <section
      v-if="selectedSequence.length > 0"
      class="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3"
    >
      <div class="flex items-center justify-between gap-2">
        <h2
          class="font-black text-teal-950 text-xs sm:text-sm flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faFilm" class="text-teal-600" />
          <span>Previsualización de Secuencia</span>
        </h2>

        <button
          type="button"
          @click="isPlaying ? stopPreview() : startPreview()"
          class="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
        >
          <FontAwesomeIcon :icon="isPlaying ? faStop : faPlay" />
          <span>{{ isPlaying ? "Detener" : "Reproducir frase" }}</span>
        </button>
      </div>

      <div v-if="isPlaying" class="flex flex-col items-center gap-2 pt-1">
        <div
          class="relative w-52 aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border-2 border-teal-500"
        >
          <video
            v-if="activeVideoUrl"
            ref="playerEl"
            :key="activeVideoUrl + '_' + currentIndex"
            :src="activeVideoUrl"
            autoplay
            playsinline
            @ended="handleVideoEnded"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center p-3 text-center text-xs font-bold text-slate-300"
          >
            Esta seña no tiene video cargado
          </div>

          <div
            class="absolute bottom-2 inset-x-2 bg-slate-950/85 text-white text-center py-1 px-2 rounded-xl text-xs font-black"
          >
            {{ currentIndex + 1 }} / {{ selectedSequence.length }} •
            {{ activeSign?.gloss }}
          </div>
        </div>
      </div>
    </section>

    <!-- Orden Gramatical de la Frase -->
    <section
      class="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3"
    >
      <h2 class="font-black text-teal-950 text-sm">
        Orden de Señas ({{ selectedSequence.length }})
      </h2>

      <p
        v-if="glossSequenceText"
        class="text-xs font-black text-teal-800 bg-teal-50 border border-teal-200 px-3 py-2 rounded-xl"
      >
        Secuencia: {{ glossSequenceText }}
      </p>

      <div v-if="selectedSequence.length > 0" class="space-y-2">
        <div
          v-for="(sign, idx) in selectedSequence"
          :key="sign.id + '_' + idx"
          class="p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span
              class="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center shrink-0"
            >
              {{ idx + 1 }}
            </span>
            <div class="min-w-0">
              <p class="text-xs font-black text-teal-950 truncate">
                {{ sign.gloss }}
              </p>
              <p class="text-[11px] font-bold text-slate-500 truncate">
                {{ sign.meaning }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <button
              type="button"
              :disabled="idx === 0"
              @click="moveSign(idx, -1)"
              class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 flex items-center justify-center cursor-pointer"
              title="Subir"
            >
              <FontAwesomeIcon :icon="faArrowUp" class="text-xs" />
            </button>
            <button
              type="button"
              :disabled="idx === selectedSequence.length - 1"
              @click="moveSign(idx, 1)"
              class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 flex items-center justify-center cursor-pointer"
              title="Bajar"
            >
              <FontAwesomeIcon :icon="faArrowDown" class="text-xs" />
            </button>
            <button
              type="button"
              @click="removeSign(idx)"
              class="w-8 h-8 rounded-xl bg-white border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center cursor-pointer"
              title="Quitar"
            >
              <FontAwesomeIcon :icon="faTrash" class="text-xs" />
            </button>
          </div>
        </div>
      </div>

      <p v-else class="text-xs font-bold text-slate-400 text-center py-4">
        Toca señas de la lista inferior para ir armando la frase en orden.
      </p>
    </section>

    <!-- Catálogo de Señas Disponibles -->
    <section
      class="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3"
    >
      <h2 class="font-black text-teal-950 text-sm">Agregar Señas</h2>

      <Input
        v-model="searchQuery"
        variant="studio"
        placeholder="Buscar por glosa o significado..."
      />

      <div class="max-h-56 overflow-y-auto space-y-1.5 pr-1">
        <button
          v-for="sign in filteredSigns"
          :key="sign.id"
          type="button"
          @click="addSign(sign)"
          class="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-400 flex items-center justify-between text-left transition-colors cursor-pointer"
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
            <FontAwesomeIcon :icon="faPlus" class="text-xs" />
          </span>
        </button>
      </div>
    </section>

    <!-- Datos de `phrases` y Guardado -->
    <form
      @submit.prevent="handleSavePhrase"
      class="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-4"
    >
      <h2 class="font-black text-teal-950 text-sm">Datos de la Frase</h2>

      <Input
        v-model="phraseForm.sentence_meaning"
        variant="studio"
        placeholder="Ej. Yo quiero comer una manzana"
        required
      >
        Significado de la Frase 
      </Input>

      <Select
        v-model="phraseForm.emotion"
        :options="emotionOptions"
        variant="studio"
        required
      >
        Emoción / Expresión No Manual 
      </Select>

      <div
        v-if="errorMessage"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-xs font-bold"
      >
        {{ errorMessage }}
      </div>

      <Button type="submit" variant="studio" class="w-full" :disabled="isSaving">
        {{ isSaving ? "Guardando..." : "Guardar Frase" }}
      </Button>
    </form>
  </main>
</template>