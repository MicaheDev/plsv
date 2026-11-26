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
  faLock,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import clsx from "clsx";

const router = useRouter();

// Nivel seleccionado (A1 por defecto)
const selectedLevel = ref("a1");

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
const completedLessonIds = ref(new Set());
const unlockedLessonIds = ref(new Set());

// Cargar progreso del usuario en `user_progress`
const fetchUserProgress = async () => {
  const userId = pb.authStore.model?.id;
  if (!userId) {
    completedLessonIds.value = new Set();
    return;
  }

  try {
    const progressRecords = await pb.collection("user_progress").getFullList({
      filter: `user = "${userId}"`,
    });
    completedLessonIds.value = new Set(
      progressRecords.map((r) => r.lesson).filter(Boolean),
    );
  } catch (error) {
    console.warn("No se pudo cargar user_progress:", error);
  }
};

// Calcula qué lecciones están desbloqueadas según el orden de módulos y lecciones
const computeUnlockedLessons = (moduleList, groupedLessons) => {
  const unlocked = new Set();
  let previousCompleted = true; // La primera lección siempre está desbloqueada

  for (const mod of moduleList) {
    const modLessons = groupedLessons[mod.id] || [];
    for (const lesson of modLessons) {
      if (previousCompleted) {
        unlocked.add(lesson.id);
      }
      previousCompleted = completedLessonIds.value.has(lesson.id);
    }
  }

  unlockedLessonIds.value = unlocked;
};

const isLessonUnlocked = (lessonId) => unlockedLessonIds.value.has(lessonId);
const isLessonCompleted = (lessonId) => completedLessonIds.value.has(lessonId);

// Cargar módulos y lecciones asociadas según el nivel seleccionado
const fetchModulesAndLessons = async () => {
  try {
    await fetchUserProgress();

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
      computeUnlockedLessons(moduleRecords, grouped);
    } else {
      lessonsByModule.value = {};
      unlockedLessonIds.value = new Set();
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

onUnmounted(() => {});

const handleLessonClick = (lesson) => {
  if (!isLessonUnlocked(lesson.id)) return;
  router.push(`/learning/lesson/${lesson.id}`);
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
            @click="handleLessonClick(lesson)"
            :class="
              clsx(
                'group flex flex-col items-center transition-transform',
                isLessonUnlocked(lesson.id)
                  ? 'cursor-pointer active:scale-95'
                  : 'opacity-55 cursor-not-allowed',
              )
            "
          >
            <div
              :class="
                clsx(
                  'w-16 h-16 rounded-full border-b-4 text-white flex items-center justify-center shadow-md transition-colors relative',
                  !isLessonUnlocked(lesson.id)
                    ? 'bg-slate-300 border-slate-500 text-slate-600'
                    : {
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
              <FontAwesomeIcon
                :icon="
                  isLessonUnlocked(lesson.id)
                    ? getIconComponent(lesson.icon)
                    : faLock
                "
                class="text-xl"
              />

              <span
                class="absolute -top-1 -right-1 w-5 h-5 bg-teal-900 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white"
              >
                {{ lesson.position }}
              </span>

              <span
                v-if="isLessonCompleted(lesson.id)"
                class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white"
              >
                <FontAwesomeIcon :icon="faCheck" />
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
