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
  faHands,
  faPlay,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { getEmotionLabel } from "@/utilities/selects";

const router = useRouter();

const signs = ref([]);
const isLoading = ref(true);
const searchQuery = ref("");

// Estado del BottomSheet
const isSheetOpen = ref(false);
const selectedSign = ref(null);
const sheetVideoEl = ref(null);

const categoryLabels = {
  sustantivo: "Sustantivo",
  verbo: "Verbo",
  adjetivo: "Adjetivo",
  expresion: "Expresión / Frase",
  otro: "Otro",
};

const fetchSigns = async () => {
  isLoading.value = true;
  try {
    signs.value = await pb.collection("signs").getFullList({
      sort: "gloss",
    });
  } catch (err) {
    console.error("Error al cargar señas:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchSigns();
});

const filteredSigns = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return signs.value;
  return signs.value.filter((s) => {
    const gram = (s.grammatical_category || s.grammatical_type || "").toLowerCase();
    return (
      s.gloss?.toLowerCase().includes(q) ||
      s.meaning?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.emotion?.toLowerCase().includes(q) ||
      gram.includes(q)
    );
  });
});

const getRepresentationUrl = (sign) => {
  if (!sign?.representation_image) return "";
  return pb.files.getURL(sign, sign.representation_image);
};

const getGuideImageUrl = (sign) => {
  if (!sign?.image) return "";
  return pb.files.getURL(sign, sign.image);
};

const getVideoUrl = (sign) => {
  if (!sign?.video) return "";
  return pb.files.getURL(sign, sign.video);
};

const formatCategory = (sign) => {
  const raw = sign?.grammatical_category || sign?.grammatical_type || "";
  return categoryLabels[raw] || raw;
};

const openSignSheet = (sign) => {
  selectedSign.value = sign;
  isSheetOpen.value = true;
};

watch(isSheetOpen, (open) => {
  if (!open && sheetVideoEl.value) {
    sheetVideoEl.value.pause();
  }
});

const deleteSign = async (sign) => {
  if (!sign?.id) return;
  if (!confirm(`¿Eliminar la seña "${sign.gloss}"?`)) return;

  try {
    await pb.collection("signs").delete(sign.id);
    isSheetOpen.value = false;
    selectedSign.value = null;
    await fetchSigns();
  } catch (err) {
    console.error("Error al eliminar la seña:", err);
    alert("No se pudo eliminar la seña.");
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
          >Studio • Diccionario</span
        >
        <h1 class="font-black text-sm text-teal-950">
          Señas ({{ signs.length }})
        </h1>
      </div>
    </div>

    <Button
      type="button"
      variant="studio"
      class="!py-2 !px-3.5 text-xs flex items-center gap-1.5"
      @click="
        router.push({
          path: '/studio/signs/new',
          query: { returnTo: '/studio/signs' },
        })
      "
    >
      <FontAwesomeIcon :icon="faPlus" />
      <span>Nueva Seña</span>
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
        placeholder="Buscar por glosa, significado, categoría o emoción..."
      />
    </div>

    <!-- Estado de carga -->
    <div
      v-if="isLoading"
      class="text-center py-12 text-xs font-black text-slate-400"
    >
      Cargando diccionario de señas...
    </div>

    <!-- Lista / Grid Mobile-First de Cards -->
    <div
      v-else-if="filteredSigns.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <article
        v-for="sign in filteredSigns"
        :key="sign.id"
        @click="openSignSheet(sign)"
        class="bg-white rounded-3xl border-2 border-slate-200 hover:border-teal-500 overflow-hidden shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
      >
        <!-- Imagen de Representación (`representation_image`) -->
        <div
          class="relative w-full aspect-video bg-slate-100 border-b border-slate-200 overflow-hidden"
        >
          <img
            v-if="getRepresentationUrl(sign)"
            :src="getRepresentationUrl(sign)"
            :alt="sign.gloss"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1"
          >
            <FontAwesomeIcon :icon="faHands" class="text-2xl text-teal-600/40" />
            <span class="text-[10px] font-bold">Sin imagen</span>
          </div>

          <!-- Indicador de video -->
          <span
            v-if="sign.video"
            class="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-slate-950/80 text-white text-[10px] font-black flex items-center gap-1"
          >
            <FontAwesomeIcon :icon="faPlay" class="text-[9px] text-teal-300" />
            <span>Ver video</span>
          </span>
        </div>

        <!-- Metadatos de la Seña -->
        <div class="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <span
                v-if="formatCategory(sign)"
                class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200"
              >
                {{ formatCategory(sign) }}
              </span>
              <span
                v-if="sign.emotion"
                class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
              >
                {{ getEmotionLabel(sign.emotion) }}
              </span>
            </div>

            <h2 class="font-black text-base text-teal-950 leading-tight">
              {{ sign.gloss }}
            </h2>
            <p class="text-xs font-bold text-slate-700">
              {{ sign.meaning }}
            </p>
          </div>

          <p
            v-if="sign.description"
            class="text-[11px] font-medium text-slate-500 line-clamp-2 pt-1 border-t border-slate-100"
          >
            {{ sign.description }}
          </p>
        </div>
      </article>
    </div>

    <div
      v-else
      class="bg-white rounded-3xl border-2 border-slate-200 p-8 text-center space-y-2"
    >
      <p class="text-sm font-black text-slate-600">
        No hay señas que coincidan con tu búsqueda.
      </p>
      <p class="text-xs font-bold text-slate-400">
        Prueba con otra glosa o crea una nueva seña.
      </p>
    </div>
  </main>

  <!-- BottomSheet con Video de la Seña -->
  <BottomSheet
    v-model="isSheetOpen"
    :title="selectedSign ? `${selectedSign.gloss} — ${selectedSign.meaning}` : ''"
  >
    <div v-if="selectedSign" class="space-y-4">
      <!-- Visor 9:16 del Video -->
      <div class="flex justify-center">
        <div
          class="w-60 sm:w-64 aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-300"
        >
          <video
            v-if="getVideoUrl(selectedSign)"
            ref="sheetVideoEl"
            :key="selectedSign.id"
            :src="getVideoUrl(selectedSign)"
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
            Esta seña aún no tiene video grabado.
          </div>
        </div>
      </div>

      <!-- Etiquetas y Descripción -->
      <div class="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="formatCategory(selectedSign)"
            class="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800"
          >
            {{ formatCategory(selectedSign) }}
          </span>
          <span
            v-if="selectedSign.emotion"
            class="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800"
          >
            {{ getEmotionLabel(selectedSign.emotion) }}
          </span>
        </div>

        <p class="text-sm font-black text-teal-950">
          {{ selectedSign.meaning }}
        </p>

        <p
          v-if="selectedSign.description"
          class="text-xs font-medium text-slate-600 leading-relaxed"
        >
          {{ selectedSign.description }}
        </p>

        <!-- Imagen guía de manos (`image`) si existe -->
        <div v-if="getGuideImageUrl(selectedSign)" class="pt-2 space-y-1">
          <span class="text-[11px] font-black text-slate-500 block"
            >Guía visual de ejecución:</span
          >
          <img
            :src="getGuideImageUrl(selectedSign)"
            :alt="`Guía ${selectedSign.gloss}`"
            class="w-full max-h-40 object-contain rounded-xl bg-white border border-slate-200"
          />
        </div>
      </div>

      <button
        type="button"
        @click="deleteSign(selectedSign)"
        class="w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
      >
        <FontAwesomeIcon :icon="faTrash" />
        <span>Eliminar Seña</span>
      </button>
    </div>
  </BottomSheet>
</template>