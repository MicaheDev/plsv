<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import pb from "@/services/pb";
import { faArrowLeft, faCrop, faFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const route = useRoute();
const router = useRouter();

const signForm = ref({
  gloss: "",
  meaning: "",
  description: "",
  grammatical_category: "sustantivo",
});

const categoryOptions = [
  { label: "Sustantivo", value: "sustantivo" },
  { label: "Verbo", value: "verbo" },
  { label: "Adjetivo", value: "adjetivo" },
  { label: "Expresión / Frase", value: "expresion" },
  { label: "Otro", value: "otro" },
];

// Estado del editor de video
const rawVideoUrl = ref("");
const videoEl = ref(null);
const duration = ref(0);
const trimStart = ref(0);
const trimEnd = ref(0);

// Encuadre y fondo
const scale = ref(1);
const offsetX = ref(0); // px relativos al lienzo base
const offsetY = ref(0);
const bgMode = ref("blur"); // "blur" | "solid"
const solidBgColor = ref("#0f172a");
const showDummyOverlay = ref(true);

// Procesamiento y subida
const processedBlob = ref(null);
const isProcessing = ref(false);
const isSaving = ref(false);
const errorMessage = ref("");

const canProcess = computed(() => Boolean(rawVideoUrl.value) && trimEnd.value > trimStart.value);

const onFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (rawVideoUrl.value) URL.revokeObjectURL(rawVideoUrl.value);
  processedBlob.value = null;
  rawVideoUrl.value = URL.createObjectURL(file);
};

const onLoadedMetadata = () => {
  if (!videoEl.value) return;
  duration.value = videoEl.value.duration || 0;
  trimStart.value = 0;
  trimEnd.value = Number(duration.value.toFixed(1));
};

// Transformación visual para la previsualización
const videoTransformStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
  transformOrigin: "center center",
}));

// Renderiza el segmento recortado a 1280x720 @ 30fps usando Canvas + MediaRecorder
const processVideo720p30fps = async () => {
  const srcVideo = videoEl.value;
  if (!srcVideo || !canProcess.value) return;

  isProcessing.value = true;
  errorMessage.value = "";
  processedBlob.value = null;

  const targetW = 1280;
  const targetH = 720;
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
  srcVideo.currentTime = trimStart.value;

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

  // Escala de desplazamiento desde contenedor preview (~360px ancho) a 1280px
  const previewScaleFactor = targetW / 360;

  const drawFrame = () => {
    if (srcVideo.paused || srcVideo.ended || srcVideo.currentTime >= trimEnd.value) {
      srcVideo.pause();
      if (recorder.state !== "inactive") recorder.stop();
      return;
    }

    // 1. Relleno de fondo
    if (bgMode.value === "blur") {
      ctx.save();
      ctx.filter = "blur(24px) brightness(0.65)";
      ctx.drawImage(srcVideo, -40, -40, targetW + 80, targetH + 80);
      ctx.restore();
    } else {
      ctx.fillStyle = solidBgColor.value;
      ctx.fillRect(0, 0, targetW, targetH);
    }

    // 2. Calcular dimensiones manteniendo relación de aspecto del video
    const vw = srcVideo.videoWidth || targetW;
    const vh = srcVideo.videoHeight || targetH;
    const baseRatio = Math.min(targetW / vw, targetH / vh);
    const drawW = vw * baseRatio * scale.value;
    const drawH = vh * baseRatio * scale.value;

    const cx = targetW / 2 + offsetX.value * previewScaleFactor;
    const cy = targetH / 2 + offsetY.value * previewScaleFactor;

    ctx.drawImage(srcVideo, cx - drawW / 2, cy - drawH / 2, drawW, drawH);

    requestAnimationFrame(drawFrame);
  };

  requestAnimationFrame(drawFrame);

  const finalBlob = await recordingDone;
  srcVideo.muted = wasMuted;
  processedBlob.value = finalBlob;
  isProcessing.value = false;
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
      const file = new File([processedBlob.value], `sign_${Date.now()}.${ext}`, {
        type: processedBlob.value.type,
      });
      formData.append("video", file);
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
});
</script>

<template>
    <header 
    class="w-full max-w-2xl mx-auto px-6 flex items-center justify-between border-b border-slate-200 h-16 bg-white sticky top-0 z-20"
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
          <span class="text-[10px] font-black text-teal-600 uppercase">Studio • Señas</span>
          <h1 class="font-black text-sm text-teal-950">Nueva Seña y Encuadre</h1>
        </div>
      </div>
    </header>

  <main class="w-full overflow-y-auto max-w-2xl mx-auto h-full pb-24">

      <!-- Editor de Video -->
      <section class="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="font-black text-teal-950 text-sm flex items-center gap-2">
            <FontAwesomeIcon :icon="faFilm" class="text-teal-600" />
            <span>Editor de Video (720p • 30fps)</span>
          </h2>
          <label class="text-xs font-black text-teal-700 flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" v-model="showDummyOverlay" class="accent-teal-600" />
            <span>Guía persona</span>
          </label>
        </div>

        <input
          type="file"
          accept="video/*"
          @change="onFileSelected"
          class="file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-teal-100 file:text-teal-800 text-xs font-bold text-slate-500 w-full cursor-pointer"
        />

        <!-- Lienzo con Overlay Dummy -->
        <div
          v-if="rawVideoUrl"
          class="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-300 select-none"
        >
          <video
            ref="videoEl"
            :src="rawVideoUrl"
            @loadedmetadata="onLoadedMetadata"
            controls
            playsinline
            :style="videoTransformStyle"
            class="w-full h-full object-contain transition-transform duration-75"
          />

          <!-- Overlay Dummy (Silueta / Marco de encuadre para LSV) -->
          <div
            v-if="showDummyOverlay"
            class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-teal-400/70"
          >
            <div class="w-24 h-24 rounded-full border-2 border-teal-300/80 bg-teal-400/10 flex items-center justify-center text-[10px] font-black text-teal-200 uppercase">
              Cabeza
            </div>
            <div class="w-48 h-28 mt-1 rounded-t-3xl border-2 border-b-0 border-teal-300/80 bg-teal-400/10 flex items-end justify-center pb-2 text-[10px] font-black text-teal-200 uppercase">
              Torso / Señas
            </div>
          </div>
        </div>

        <!-- Controles de Recorte y Encuadre -->
        <div v-if="rawVideoUrl" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <p class="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <FontAwesomeIcon :icon="faCrop" class="text-teal-600" />
              <span>Recorte ({{ trimStart }}s - {{ trimEnd }}s)</span>
            </p>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500 block">Inicio (s)</label>
              <input
                type="range"
                min="0"
                :max="Math.max(0, trimEnd - 0.5)"
                step="0.1"
                v-model.number="trimStart"
                class="w-full accent-teal-600"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500 block">Fin (s)</label>
              <input
                type="range"
                :min="Math.min(duration, trimStart + 0.5)"
                :max="duration"
                step="0.1"
                v-model.number="trimEnd"
                class="w-full accent-teal-600"
              />
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <p class="text-xs font-black text-slate-700">Encuadre y Fondo</p>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-bold text-slate-500">Zoom</span>
              <input
                type="range"
                min="0.6"
                max="2"
                step="0.05"
                v-model.number="scale"
                class="w-32 accent-teal-600"
              />
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-bold text-slate-500">Mover X</span>
              <input
                type="range"
                min="-120"
                max="120"
                step="2"
                v-model.number="offsetX"
                class="w-32 accent-teal-600"
              />
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-bold text-slate-500">Mover Y</span>
              <input
                type="range"
                min="-100"
                max="100"
                step="2"
                v-model.number="offsetY"
                class="w-32 accent-teal-600"
              />
            </div>
            <div class="flex items-center gap-2 pt-1">
              <select
                v-model="bgMode"
                class="text-xs font-bold rounded-xl border border-slate-300 px-2 py-1 bg-white"
              >
                <option value="blur">Fondo desenfocado</option>
                <option value="solid">Color sólido</option>
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

        <div v-if="rawVideoUrl" class="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="studio"
            class="w-full"
            :disabled="!canProcess || isProcessing"
            @click="processVideo720p30fps"
          >
            {{ isProcessing ? "Procesando 720p 30fps..." : "Generar Clip 720p 30fps" }}
          </Button>
        </div>

        <p v-if="processedBlob" class="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
          Clip listo ({{ (processedBlob.size / (1024 * 1024)).toFixed(2) }} MB) para guardar con la seña.
        </p>
      </section>

      <!-- Datos de la Seña -->
      <form @submit.prevent="handleSaveSign" class="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-4 shadow-sm">
        <h2 class="font-black text-teal-950 text-sm">Datos de la Seña</h2>

        <Input v-model="signForm.gloss" variant="studio" placeholder="Ej. HOLA" required>
          Glosa
        </Input>

        <Input v-model="signForm.meaning" variant="studio" placeholder="Ej. Saludo" required>
          Significado
        </Input>

        <Select v-model="signForm.grammatical_category" :options="categoryOptions" variant="studio" required>
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

        <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-xs font-bold">
          {{ errorMessage }}
        </div>

        <Button type="submit" variant="studio" class="w-full" :disabled="isSaving || isProcessing">
          {{ isSaving ? "Guardando..." : "Guardar Seña y Volver al Reto" }}
        </Button>
      </form>
    </main>
</template>