<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

import pb from "@/services/pb";
import {
  faBookOpen,
  faDumbbell,
  faFlagCheckered,
  faHands,
  faGamepad,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import clsx from "clsx";

const router = useRouter();

// Nivel seleccionado (A1 por defecto)
const selectedLevel = ref("a1");

// Mapeo de nombres de iconos a objetos de FontAwesome
const availableIcons = [
  { name: "faBookOpen", icon: faBookOpen, label: "Libro" },
  { name: "faDumbbell", icon: faDumbbell, label: "Pesas" },
  { name: "faFlagCheckered", icon: faFlagCheckered, label: "Bandera" },
  { name: "faHands", icon: faHands, label: "Manos" },
  { name: "faGamepad", icon: faGamepad, label: "Juego" },
];

const getIconComponent = (iconName) => {
  const found = availableIcons.find((i) => i.name === iconName);
  return found ? found.icon : faBookOpen;
};

// Estados de datos
const modules = ref([]);
const lessonsByModule = ref({});


// Cargar módulos y lecciones asociadas según el nivel seleccionado
const fetchModulesAndLessons = async () => {
  try {
    const moduleRecords = await pb.collection("modules").getFullList({
      filter: `mcer_level = "${selectedLevel.value}" && is_published = true`,
      sort: "position",
    });
    modules.value = moduleRecords;

    if (moduleRecords.length > 0) {
      const moduleIdsFilter = moduleRecords
        .map((m) => `module_id = "${m.id}" && is_published = true`)
        .join(" || ");

      const lessonRecords = await pb.collection("lessons").getFullList({
        filter: moduleIdsFilter,
        sort: "position",
      });

      const grouped = {};
      moduleRecords.forEach((m) => {
        grouped[m.id] = [];
      });
      lessonRecords.forEach((lesson) => {
        if (grouped[lesson.module_id]) {
          grouped[lesson.module_id].push(lesson);
        }
      });

      lessonsByModule.value = grouped;
    } else {
      lessonsByModule.value = {};
    }
  } catch (error) {
    console.error("Error al cargar la ruta pedagógica:", error);
  }
};

watch(selectedLevel, () => {
  fetchModulesAndLessons();
});

onMounted(() => {
  fetchModulesAndLessons();
});

onUnmounted(() => {
});


const goToLessonDetail = (lessonId) => {
  router.push(`/studio/lesson/${lessonId}`);
};

const getZigzagStyle = (index) => {
  const pattern = [0, 45, 0, -45];
  const offset = pattern[index % 4];
  return {
    transform: `translateX(${offset}px)`,
  };
};
</script>

<template>
  <div class="w-full mx-auto p-4 space-y-6 bg-white min-h-screen pb-24">
    <!-- Lista Vertical de Módulos -->
    <div class="space-y-10">
      <div
        v-for="(mod, _) in modules"
        :key="mod.id"
        class="rounded-3xl relative"
      >
        <div
          class="flex flex-col justify-between items-start mb-6 pb-3 border-b-2 border-slate-200 relative"
        >
          <span
            class="text-xs font-black text-center text-blue-600 uppercase tracking-wider"
          >
            Módulo {{ mod.position }}
          </span>
          <h2 class="font-black text-xl text-teal-950">{{ mod.title }}</h2>
          <p
            v-if="mod.description"
            class="text-xs font-bold text-slate-500 mt-0.5"
          >
            {{ mod.description }}
          </p>
        </div>

        <!-- Ruta en Zigzag de Lecciones -->
        <div class="flex flex-col items-center gap-6 my-4 py-2">
          <div
            v-for="(lesson, lIndex) in lessonsByModule[mod.id] || []"
            :key="lesson.id"
            :style="getZigzagStyle(lIndex)"
            @click="() => console.log('Aun en construcción: ' + lesson.title)"
            class="group flex flex-col items-center cursor-pointer transition-transform active:scale-95"
          >
            <div
              :class="
                clsx(
                  'w-16 h-16 rounded-full border-b-4 text-white flex items-center justify-center shadow-md  transition-colors relative',
                  {
                    'bg-red-400 border-red-700 group-hover:bg-red-600':
                      lesson.color === 'red',
                    'bg-blue-400 border-blue-700 group-hover:bg-blue-600':
                      lesson.color === 'blue',
                    'bg-green-400 border-green-700 group-hover:bg-green-600':
                      lesson.color === 'green',
                    'bg-yellow-400 border-yellow-700 group-hover:bg-yellow-600':
                      lesson.color === 'yellow',
                    'bg-gray-400 border-gray-700 group-hover:bg-gray-600':
                      !lesson.color,
                  },
                )
              "
            >
              <!-- Renderiza el icono dinámico guardado en la lección -->
              <FontAwesomeIcon
                :icon="getIconComponent(lesson.icon)"
                class="text-xl"
              />
              <span
                class="absolute -top-1 -right-1 w-5 h-5 bg-teal-900 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white"
              >
                {{ lesson.position }}
              </span>
            </div>
            <span
              class="text-xs font-black text-slate-700 mt-1 max-w-[200px] text-center truncate"
            >
              {{ lesson.title }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
