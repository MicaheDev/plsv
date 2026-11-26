<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import pb from "@/services/pb";
import {
  faArrowLeft,
  faCrop,
  faFilm,
  faCloudArrowUp,
  faImage,
  faShapes,
  faTrash,
  faPlay,
  faPause,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { categoryOptions } from "@/utilities/selects";

const route = useRoute();
const router = useRouter();

const signForm = ref({
  gloss: "",
  meaning: "",
  description: "",
  grammatical_category: "NOUN",
});


// Estado del video y recorte temporal
const rawVideoUrl = ref("");
const rawVideoName = ref("");
const videoInputEl = ref(null);
const videoEl = ref(null);
const previewBoxEl = ref(null);
const isDraggingVideo = ref(false);
const isPlayingPreview = ref(false);
const loopTrimRange = ref(true);

const duration = ref(0);
const trimStart = ref(0);
const trimEnd = ref(0);
const currentPlayTime = ref(0);

const clipDuration = computed(() =>
  Math.max(0, Number((trimEnd.value - trimStart.value).toFixed(2))),
);

// Encuadre 9:16 con libertad de valores (sliders + inputs numéricos)
const zoom = ref(1);
const offsetX = ref(0); // % relativo al ancho del marco 9:16
const offsetY = ref(0); // % relativo al alto del marco 9:16
const bgMode = ref("blur"); // "blur" | "solid"
const solidBgColor = ref("#0f172a");
const showDummyOverlay = ref(true);
const showCropGuides = ref(true);

// Imágenes multimedia de la seña en PocketBase: `image` y `representation_image`
const signImageFile = ref(null);
const signImagePreview = ref("");
const representationImageFile = ref(null);
const representationImagePreview = ref("");

// Procesamiento y guardado
const processedBlob = ref(null);
const isProcessing = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const canProcess = computed(
  () => Boolean(rawVideoUrl.value) && clipDuration.value > 0.05,
);

const setVideoSource = (file) => {
  if (!file || !file.type.startsWith("video/")) {
    errorMessage.value = "Selecciona un archivo de video válido.";
    return;
  }
  errorMessage.value = "";
  if (rawVideoUrl.value) URL.revokeObjectURL(rawVideoUrl.value);
  processedBlob.value = null;
  rawVideoName.value = file.name;
  rawVideoUrl.value = URL.createObjectURL(file);
};

const onVideoInputChange = (e) => {
  const file = e.target.files?.[0];
  if (file) setVideoSource(file);
};

const onVideoDrop = (e) => {
  e.preventDefault();
  isDraggingVideo.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) setVideoSource(file);
};

const onLoadedMetadata = () => {
  if (!videoEl.value) return;
  const d = Number((videoEl.value.duration || 0).toFixed(2));
  duration.value = d;
  trimStart.value = 0;
  trimEnd.value = d;
  currentPlayTime.value = 0;
};

// Reproducción en vivo respetando el tramo [trimStart, trimEnd] sin modificar el archivo
const togglePlayTrimmedRange = async () => {
  const v = videoEl.value;
  if (!v) return;

  if (!v.paused) {
    v.pause();
    isPlayingPreview.value = false;
    return;
  }

  const start = Math.max(0, Number(trimStart.value) || 0);
  const end = Number(trimEnd.value) > start ? Number(trimEnd.value) : duration.value;

  if (v.currentTime < start || v.currentTime >= end) {
    v.currentTime = start;
  }

  try {
    await v.play();
    isPlayingPreview.value = true;
  } catch (e) {
    console.warn("No se pudo iniciar reproducción:", e);
  }
};

const onTimeUpdate = () => {
  const v = videoEl.value;
  if (!v || isProcessing.value) return;

  currentPlayTime.value = Number(v.currentTime.toFixed(2));

  const start = Math.max(0, Number(trimStart.value) || 0);
  const end = Number(trimEnd.value) || duration.value;

  if (end > start && v.currentTime >= end) {
    if (loopTrimRange.value && !v.paused) {
      v.currentTime = start;
    } else {
      v.pause();
      isPlayingPreview.value = false;
      v.currentTime = end;
    }
  }
};

const onScrubTimeline = (e) => {
  const val = Number(e.target.value);
  currentPlayTime.value = val;
  if (videoEl.value) {
    videoEl.value.currentTime = val;
  }
};

// Normalizar valores numéricos manuales de inicio/fin
const normalizeTrimInputs = () => {
  let s = Number(trimStart.value);
  let e = Number(trimEnd.value);

  if (Number.isNaN(s) || s < 0) s = 0;
  if (duration.value > 0 && s > duration.value) s = duration.value;

  if (Number.isNaN(e) || e <= s) {
    e = duration.value > 0 ? Math.min(duration.value, Number((s + 0.2).toFixed(2))) : Number((s + 0.2).toFixed(2));
  }
  if (duration.value > 0 && e > duration.value) e = duration.value;

  trimStart.value = Number(s.toFixed(2));
  trimEnd.value = Number(e.toFixed(2));
};

watch(trimStart, (val) => {
  if (videoEl.value && !isPlayingPreview.value && !isProcessing.value) {
    const num = Number(val);
    if (!Number.isNaN(num) && num >= 0) {
      videoEl.value.currentTime = Math.min(num, duration.value || num);
      currentPlayTime.value = videoEl.value.currentTime;
    }
  }
});

const resetFraming = () => {
  zoom.value = 1;
  offsetX.value = 0;
  offsetY.value = 0;
};

// Cálculo compartido para previsualización 9:16 y exportación 720x1280
const computeRectInCanvas = (vw, vh, canvasW, canvasH, pctX, pctY, zoomVal) => {
  const safeVw = vw || canvasW;
  const safeVh = vh || canvasH;
  const safeZoom = Math.max(0.1, Number(zoomVal) || 1);
  const safeX = Number(pctX) || 0;
  const safeY = Number(pctY) || 0;

  const baseCoverRatio = Math.max(canvasW / safeVw, canvasH / safeVh);
  const drawW = safeVw * baseCoverRatio * safeZoom;
  const drawH = safeVh * baseCoverRatio * safeZoom;

  const cx = canvasW / 2 + (safeX / 100) * canvasW;
  const cy = canvasH / 2 + (safeY / 100) * canvasH;

  return {
    x: cx - drawW / 2,
    y: cy - drawH / 2,
    w: drawW,
    h: drawH,
  };
};

// Estilo visual en la previsualización 9:16
const videoPreviewStyle = computed(() => {
  const vw = videoEl.value?.videoWidth || 1280;
  const vh = videoEl.value?.videoHeight || 720;
  const boxW = previewBoxEl.value?.clientWidth || 270;
  const boxH = previewBoxEl.value?.clientHeight || 480;

  const rect = computeRectInCanvas(
    vw,
    vh,
    boxW,
    boxH,
    offsetX.value,
    offsetY.value,
    zoom.value,
  );

  return {
    position: "absolute",
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.w}px`,
    height: `${rect.h}px`,
    maxWidth: "none",
  };
});

// Renderiza el tramo recortado en 9:16 (720x1280 @ 30fps) sin alterar el archivo original
const processVideo9x16_30fps = async () => {
  const srcVideo = videoEl.value;
  if (!srcVideo || !canProcess.value) return;

  normalizeTrimInputs();
  isPlayingPreview.value = false;
  isProcessing.value = true;
  errorMessage.value = "";
  processedBlob.value = null;

  const targetW = 720;
  const targetH = 1280;
  const fps = 30;

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2_500_000,
  });

  const chunks = [];
  recorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) chunks.push(ev.data);
  };

  const wasMuted = srcVideo.muted;
  srcVideo.muted = true;
  srcVideo.currentTime = Number(trimStart.value);

  await new Promise((resolve) => {
    srcVideo.onseeked = resolve;
  });

  const recordingDone = new Promise((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  recorder.start();
  await srcVideo.play();

  const endSec = Number(trimEnd.value);

  const drawFrame = () => {
    if (
      srcVideo.paused ||
      srcVideo.ended ||
      srcVideo.currentTime >= endSec
    ) {
      srcVideo.pause();
      if (recorder.state !== "inactive") recorder.stop();
      return;
    }

    if (bgMode.value === "blur") {
      ctx.save();
      ctx.filter = "blur(24px) brightness(0.6)";
      ctx.drawImage(srcVideo, -40, -40, targetW + 80, targetH + 80);
      ctx.restore();
    } else {
      ctx.fillStyle = solidBgColor.value;
      ctx.fillRect(0, 0, targetW, targetH);
    }

    const rect = computeRectInCanvas(
      srcVideo.videoWidth,
      srcVideo.videoHeight,
      targetW,
      targetH,
      offsetX.value,
      offsetY.value,
      zoom.value,
    );

    ctx.drawImage(srcVideo, rect.x, rect.y, rect.w, rect.h);

    requestAnimationFrame(drawFrame);
  };

  requestAnimationFrame(drawFrame);

  const finalBlob = await recordingDone;
  srcVideo.muted = wasMuted;
  processedBlob.value = finalBlob;
  isProcessing.value = false;
};

// Manejo de imágenes `image` y `representation_image`
const handleSignImageSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (signImagePreview.value) URL.revokeObjectURL(signImagePreview.value);
  signImageFile.value = file;
  signImagePreview.value = URL.createObjectURL(file);
};

const clearSignImage = () => {
  if (signImagePreview.value) URL.revokeObjectURL(signImagePreview.value);
  signImageFile.value = null;
  signImagePreview.value = "";
};

const handleRepresentationImageSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (representationImagePreview.value)
    URL.revokeObjectURL(representationImagePreview.value);
  representationImageFile.value = file;
  representationImagePreview.value = URL.createObjectURL(file);
};

const clearRepresentationImage = () => {
  if (representationImagePreview.value)
    URL.revokeObjectURL(representationImagePreview.value);
  representationImageFile.value = null;
  representationImagePreview.value = "";
};

const handleSaveSign = async () => {
  isSaving.value = true;
  errorMessage.value = "";

  try {
    const formData = new FormData();
    formData.append("gloss", signForm.value.gloss);
    formData.append("meaning", signForm.value.meaning);
    formData.append("description", signForm.value.description);
    formData.append("grammatical_category", signForm.value.grammatical_category);

    if (processedBlob.value) {
      const ext = processedBlob.value.type.includes("webp") ? "webp" : "webm";
      const videoOut = new File(
        [processedBlob.value],
        `sign_9x16_${Date.now()}.${ext}`,
        { type: processedBlob.value.type },
      );
      formData.append("video", videoOut);
    }

    if (signImageFile.value) {
      formData.append("image", signImageFile.value);
    }

    if (representationImageFile.value) {
      formData.append("representation_image", representationImageFile.value);
    }

    const newSign = await pb.collection("signs").create(formData);
    sessionStorage.setItem("studio_newly_created_sign_id", newSign.id);

    const returnTo = route.query.returnTo || "/studio/route";
    router.push(returnTo);
  } catch (err) {
    console.error("Error al guardar seña:", err);
    errorMessage.value =
      err?.data?.message || err?.message || "No se pudo guardar la seña.";
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  const returnTo = route.query.returnTo || "/studio/route";
  router.push(returnTo);
};

onBeforeUnmount(() => {
  if (rawVideoUrl.value) URL.revokeObjectURL(rawVideoUrl.value);
  if (signImagePreview.value) URL.revokeObjectURL(signImagePreview.value);
  if (representationImagePreview.value)
    URL.revokeObjectURL(representationImagePreview.value);
});
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
          >Studio • Señas</span
        >
        <h1 class="font-black text-sm text-teal-950">Nueva Seña</h1>
      </div>
    </div>
  </header>

  <main class="w-full overflow-y-auto max-w-2xl mx-auto h-full pb-28">
    <!-- Editor de Video 9:16 con Reproducción de Tramo en Vivo y Controles Numéricos -->
    <section class="bg-white p-4 space-y-4 border-b-2 border-slate-100">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="font-black text-teal-950 text-sm flex items-center gap-2">
          <FontAwesomeIcon :icon="faFilm" class="text-teal-600" />
          <span>Video de la Seña</span>
        </h2>

        <div class="flex items-center gap-3">
          <label
            class="text-xs font-black text-teal-700 flex items-center gap-1.5 cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="showCropGuides"
              class="accent-teal-600"
            />
            <span>Guías recorte</span>
          </label>
          <label
            class="text-xs font-black text-teal-700 flex items-center gap-1.5 cursor-pointer"
          >
            <input
              type="checkbox"
              v-model="showDummyOverlay"
              class="accent-teal-600"
            />
            <span>Guía persona</span>
          </label>
        </div>
      </div>

      <!-- Dropzone en Español -->
      <div
        @dragover.prevent="isDraggingVideo = true"
        @dragleave.prevent="isDraggingVideo = false"
        @drop="onVideoDrop"
        @click="videoInputEl?.click()"
        :class="[
          'rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all select-none',
          isDraggingVideo
            ? 'border-teal-600 bg-teal-50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50 hover:border-teal-500 hover:bg-teal-50/40',
        ]"
      >
        <input
          ref="videoInputEl"
          type="file"
          accept="video/*"
          @change="onVideoInputChange"
          class="hidden"
        />
        <div class="flex flex-col items-center gap-1.5">
          <div
            class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center"
          >
            <FontAwesomeIcon :icon="faCloudArrowUp" class="text-lg" />
          </div>
          <p class="text-xs font-black text-teal-950">
            {{
              rawVideoName
                ? `Video cargado: ${rawVideoName}`
                : "Arrastra un video aquí o toca para seleccionar"
            }}
          </p>
          <p class="text-[11px] font-bold text-slate-500">
            Admite videos horizontales o verticales • El archivo original no se
            altera hasta generar el clip
          </p>
        </div>
      </div>

      <!-- Vista Previa Real en 9:16 + Timeline Reproducible del Tramo -->
      <div v-if="rawVideoUrl" class="space-y-3">
        <div class="flex justify-center">
          <div
            ref="previewBoxEl"
            class="relative w-64 sm:w-72 aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-300 select-none shrink-0"
          >
            <div
              v-if="bgMode === 'solid'"
              class="absolute inset-0"
              :style="{ backgroundColor: solidBgColor }"
            />

            <video
              ref="videoEl"
              :src="rawVideoUrl"
              @loadedmetadata="onLoadedMetadata"
              @timeupdate="onTimeUpdate"
              @play="isPlayingPreview = true"
              @pause="isPlayingPreview = false"
              playsinline
              :style="videoPreviewStyle"
              class="transition-none"
            />

            <!-- Guías de Recorte -->
            <div
              v-if="showCropGuides"
              class="pointer-events-none absolute inset-0 flex justify-between z-10"
            >
              <div
                class="w-[10%] h-full bg-slate-950/65 border-r border-dashed border-amber-300/80 flex items-center justify-center"
              >
                <span
                  class="-rotate-90 text-[8px] font-black tracking-widest text-amber-200 uppercase whitespace-nowrap"
                >
                  Recorte
                </span>
              </div>

              <div class="relative flex-1 h-full">
                <div
                  class="absolute inset-y-0 left-1/3 border-l border-white/15"
                />
                <div
                  class="absolute inset-y-0 right-1/3 border-r border-white/15"
                />
                <div
                  class="absolute inset-x-0 top-1/2 border-t border-white/15"
                />

                <span
                  class="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-teal-300"
                />
                <span
                  class="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-teal-300"
                />
                <span
                  class="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-teal-300"
                />
                <span
                  class="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-teal-300"
                />
              </div>

              <div
                class="w-[10%] h-full bg-slate-950/65 border-l border-dashed border-amber-300/80 flex items-center justify-center"
              >
                <span
                  class="rotate-90 text-[8px] font-black tracking-widest text-amber-200 uppercase whitespace-nowrap"
                >
                  Recorte
                </span>
              </div>
            </div>

            <!-- Guía Dummy Homogénea -->
            <div
              v-if="showDummyOverlay"
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-10"
            >
              <div
                class="w-[26%] aspect-square rounded-full border-2 border-teal-300/90 bg-teal-400/10 flex items-center justify-center text-[9px] font-black text-teal-200 uppercase"
              >
                Cabeza
              </div>
              <div
                class="w-[62%] h-[28%] mt-1.5 rounded-t-3xl border-2 border-b-0 border-teal-300/90 bg-teal-400/10 flex items-end justify-center pb-2 text-[9px] font-black text-teal-200 uppercase"
              >
                Torso / Señas
              </div>
            </div>
          </div>
        </div>

        <!-- Barra de Reproducción del Tramo en Vivo -->
        <div
          class="p-3 rounded-2xl bg-slate-900 text-white space-y-2 border-2 border-slate-700"
        >
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              @click="togglePlayTrimmedRange"
              class="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FontAwesomeIcon
                :icon="isPlayingPreview ? faPause : faPlay"
              />
              <span>{{
                isPlayingPreview ? "Pausar tramo" : "Reproducir tramo"
              }}</span>
            </button>

            <label
              class="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="loopTrimRange"
                class="accent-teal-400"
              />
              <FontAwesomeIcon :icon="faRotateRight" class="text-teal-400" />
              <span>Repetir tramo</span>
            </label>

            <span class="text-[11px] font-mono font-bold text-teal-300">
              {{ currentPlayTime.toFixed(1) }}s / {{ duration.toFixed(1) }}s
            </span>
          </div>

          <input
            type="range"
            min="0"
            :max="duration || 0"
            step="0.05"
            :value="currentPlayTime"
            @input="onScrubTimeline"
            class="w-full accent-teal-400"
          />

          <div
            class="flex items-center justify-between text-[11px] font-bold text-slate-400"
          >
            <span>Tramo activo: {{ trimStart }}s → {{ trimEnd }}s</span>
            <span class="text-teal-300">Duración clip: {{ clipDuration }}s</span>
          </div>
        </div>

        <!-- Controles: Recorte Temporal + Encuadre con Sliders e Inputs Numéricos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <!-- Recorte de Tiempo (Slider + Input Numérico) -->
          <div
            class="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3"
          >
            <div class="flex items-center justify-between">
              <p
                class="text-xs font-black text-teal-950 flex items-center gap-1.5"
              >
                <FontAwesomeIcon :icon="faCrop" class="text-teal-600" />
                <span>Recorte de Tiempo</span>
              </p>
              <span class="text-[11px] font-black text-teal-700"
                >{{ clipDuration }}s</span
              >
            </div>

            <!-- Inicio (s) -->
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <label class="text-[11px] font-bold text-slate-600"
                  >Inicio (s)</label
                >
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  :max="duration || 9999"
                  v-model.number="trimStart"
                  @change="normalizeTrimInputs"
                  class="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-black text-slate-800 text-right focus:border-teal-600 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="0"
                :max="duration || 0"
                step="0.05"
                v-model.number="trimStart"
                @change="normalizeTrimInputs"
                class="w-full accent-teal-600"
              />
            </div>

            <!-- Fin (s) -->
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <label class="text-[11px] font-bold text-slate-600"
                  >Fin (s)</label
                >
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  :max="duration || 9999"
                  v-model.number="trimEnd"
                  @change="normalizeTrimInputs"
                  class="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-black text-slate-800 text-right focus:border-teal-600 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="0"
                :max="duration || 0"
                step="0.05"
                v-model.number="trimEnd"
                @change="normalizeTrimInputs"
                class="w-full accent-teal-600"
              />
            </div>
          </div>

          <!-- Encuadre Homogéneo (Sliders + Inputs Numéricos con libertad) -->
          <div
            class="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-black text-teal-950">Encuadre (9:16)</p>
              <button
                type="button"
                @click="resetFraming"
                class="text-[11px] font-black text-teal-700 hover:underline cursor-pointer"
              >
                Centrar
              </button>
            </div>

            <!-- Zoom -->
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-bold text-slate-600">Zoom</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="5"
                  v-model.number="zoom"
                  class="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-black text-slate-800 text-right focus:border-teal-600 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="0.4"
                max="3"
                step="0.05"
                v-model.number="zoom"
                class="w-full accent-teal-600"
              />
            </div>

            <!-- Posición X -->
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-bold text-slate-600"
                  >Mover X (%)</span
                >
                <input
                  type="number"
                  step="1"
                  min="-200"
                  max="200"
                  v-model.number="offsetX"
                  class="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-black text-slate-800 text-right focus:border-teal-600 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                v-model.number="offsetX"
                class="w-full accent-teal-600"
              />
            </div>

            <!-- Posición Y -->
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-bold text-slate-600"
                  >Mover Y (%)</span
                >
                <input
                  type="number"
                  step="1"
                  min="-200"
                  max="200"
                  v-model.number="offsetY"
                  class="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-black text-slate-800 text-right focus:border-teal-600 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                v-model.number="offsetY"
                class="w-full accent-teal-600"
              />
            </div>

            <div class="flex items-center gap-2 pt-0.5">
              <select
                v-model="bgMode"
                class="text-xs font-bold rounded-xl border border-slate-300 px-2 py-1 bg-white flex-1"
              >
                <option value="blur">Borde desenfocado</option>
                <option value="solid">Borde color sólido</option>
              </select>
              <input
                v-if="bgMode === 'solid'"
                type="color"
                v-model="solidBgColor"
                class="w-8 h-7 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="studio"
          class="w-full"
          :disabled="!canProcess || isProcessing"
          @click="processVideo9x16_30fps"
        >
          {{
            isProcessing
              ? "Generando clip..."
              : "Generar Clip"
          }}
        </Button>

        <p
          v-if="processedBlob"
          class="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl"
        >
          Clip generado ({{
            (processedBlob.size / (1024 * 1024)).toFixed(2)
          }}
          MB) listo para guardar.
        </p>
      </div>
    </section>

    <!-- Imágenes de Apoyo (Mobile-First): `image` y `representation_image` -->
    <section class="bg-white p-4 space-y-4 border-b-2 border-slate-100">
      <h2 class="font-black text-teal-950 text-sm">
        Imágenes de Apoyo de la Seña
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Campo `image` -->
        <div
          class="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col justify-between gap-3"
        >
          <div class="space-y-1">
            <label
              class="text-xs font-black text-teal-950 flex items-center gap-1.5"
            >
              <FontAwesomeIcon :icon="faImage" class="text-teal-600" />
              <span>Imagen de ejecución</span>
            </label>
            <p class="text-[11px] font-bold text-slate-500">
              Manos o guía de movimiento para realizar la seña.
            </p>
          </div>

          <div
            v-if="signImagePreview"
            class="relative rounded-xl overflow-hidden border border-slate-200 bg-white aspect-video"
          >
            <img
              :src="signImagePreview"
              alt="Imagen de ejecución"
              class="w-full h-full object-cover"
            />
            <button
              type="button"
              @click="clearSignImage"
              class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow cursor-pointer"
              title="Quitar imagen"
            >
              <FontAwesomeIcon :icon="faTrash" class="text-xs" />
            </button>
          </div>

          <label
            class="w-full py-2.5 px-3 rounded-xl bg-white border-2 border-teal-200 hover:border-teal-500 text-teal-800 text-xs font-black text-center cursor-pointer transition-colors"
          >
            {{ signImageFile ? "Cambiar imagen" : "Seleccionar imagen" }}
            <input
              type="file"
              accept="image/*"
              @change="handleSignImageSelect"
              class="hidden"
            />
          </label>
        </div>

        <!-- Campo `representation_image` -->
        <div
          class="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col justify-between gap-3"
        >
          <div class="space-y-1">
            <label
              class="text-xs font-black text-teal-950 flex items-center gap-1.5"
            >
              <FontAwesomeIcon :icon="faShapes" class="text-teal-600" />
              <span>Imagen de representación</span>
            </label>
            <p class="text-[11px] font-bold text-slate-500">
              Dibujo o foto del concepto (ej. una manzana).
            </p>
          </div>

          <div
            v-if="representationImagePreview"
            class="relative rounded-xl overflow-hidden border border-slate-200 bg-white aspect-video"
          >
            <img
              :src="representationImagePreview"
              alt="Imagen de representación"
              class="w-full h-full object-cover"
            />
            <button
              type="button"
              @click="clearRepresentationImage"
              class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow cursor-pointer"
              title="Quitar representación"
            >
              <FontAwesomeIcon :icon="faTrash" class="text-xs" />
            </button>
          </div>

          <label
            class="w-full py-2.5 px-3 rounded-xl bg-white border-2 border-teal-200 hover:border-teal-500 text-teal-800 text-xs font-black text-center cursor-pointer transition-colors"
          >
            {{
              representationImageFile
                ? "Cambiar representación"
                : "Seleccionar representación"
            }}
            <input
              type="file"
              accept="image/*"
              @change="handleRepresentationImageSelect"
              class="hidden"
            />
          </label>
        </div>
      </div>
    </section>

    <!-- Datos de la Seña -->
    <form @submit.prevent="handleSaveSign" class="bg-white p-4 space-y-4">
      <h2 class="font-black text-teal-950 text-sm">Datos de la Seña</h2>

      <Input
        v-model="signForm.gloss"
        variant="studio"
        placeholder="Ej. MANZANA"
        required
      >
        Glosa
      </Input>

      <Input
        v-model="signForm.meaning"
        variant="studio"
        placeholder="Ej. Fruta manzana"
        required
      >
        Significado
      </Input>

      <Select
        v-model="signForm.grammatical_category"
        :options="categoryOptions"
        variant="studio"
        required
      >
        Categoría Gramatical
      </Select>

      <div class="flex flex-col gap-1.5">
        <label class="font-black text-teal-900 text-sm">Descripción</label>
        <textarea
          v-model="signForm.description"
          rows="2"
          class="px-4 py-2 resize-none rounded-2xl w-full text-sm font-bold border-2 border-slate-200 bg-gray-50 focus:border-teal-600 focus:outline-none"
          placeholder="Detalle de ejecución..."
        />
      </div>

      <div
        v-if="errorMessage"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-xs font-bold"
      >
        {{ errorMessage }}
      </div>

      <Button
        type="submit"
        variant="studio"
        class="w-full"
        :disabled="isSaving || isProcessing"
      >
        {{ isSaving ? "Guardando..." : "Guardar Seña" }}
      </Button>
    </form>
  </main>
</template>