<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import Modal from "@/components/Modal.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import Switch from "@/components/Switch.vue";
import pb from "@/services/pb";
import {
  faPlus,
  faBookOpen,
  faStar,
  faGem,
  faClock,
  faEllipsisVertical,
  faPen,
  faTrash,
  faArrowUp,
  faArrowDown,
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

const levelOptions = [
  { label: "Nivel A1", value: "a1" },
  { label: "Nivel A2", value: "a2" },
  { label: "Nivel B1", value: "b1" },
  { label: "Nivel B2", value: "b2" },
  { label: "Nivel C1", value: "c1" },
  { label: "Nivel C2", value: "c2" },
];


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

// Estados de Modales y Edición
const isModuleSheetOpen = ref(false);
const isLessonSheetOpen = ref(false);
const isIconModalOpen = ref(false); // Estado para el modal de selección de iconos
const activeModuleIdForLesson = ref(null);
const editingModuleId = ref(null);
const activeDropdownId = ref(null);

// Formulario de Módulo
const moduleForm = ref({
  title: "",
  description: "",
  position: 1,
  is_published: true,
});

// Formulario de Lección (Incluye el campo icon por defecto)
const lessonForm = ref({
  title: "",
  icon: "faBookOpen",
  xp_reward: 10,
  gems_reward: 5,
  estimated_duration: 5,
  position: 1,
  is_published: true,
});

// Cargar módulos y lecciones asociadas según el nivel seleccionado
const fetchModulesAndLessons = async () => {
  try {
    const moduleRecords = await pb.collection("modules").getFullList({
      filter: `mcer_level = "${selectedLevel.value}"`,
      sort: "position",
    });
    modules.value = moduleRecords;

    if (moduleRecords.length > 0) {
      const moduleIdsFilter = moduleRecords
        .map((m) => `module_id = "${m.id}"`)
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
  document.addEventListener("click", closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdowns);
});

const closeDropdowns = () => {
  activeDropdownId.value = null;
};

const toggleDropdown = (modId, event) => {
  event.stopPropagation();
  activeDropdownId.value = activeDropdownId.value === modId ? null : modId;
};

// --- CRUD MÓDULOS ---

const openNewModuleSheet = () => {
  editingModuleId.value = null;
  const nextPos = modules.value.length + 1;
  moduleForm.value = {
    title: "",
    description: "",
    position: nextPos,
    is_published: true,
  };
  isModuleSheetOpen.value = true;
};

const openEditModuleSheet = (mod, event) => {
  event.stopPropagation();
  activeDropdownId.value = null;
  editingModuleId.value = mod.id;
  moduleForm.value = {
    title: mod.title,
    description: mod.description,
    position: mod.position,
    is_published: mod.is_published,
  };
  isModuleSheetOpen.value = true;
};

const saveModule = async () => {
  try {
    if (editingModuleId.value) {
      await pb.collection("modules").update(editingModuleId.value, {
        title: moduleForm.value.title,
        description: moduleForm.value.description,
        position: Number(moduleForm.value.position),
        is_published: moduleForm.value.is_published,
      });
    } else {
      await pb.collection("modules").create({
        title: moduleForm.value.title,
        description: moduleForm.value.description,
        position: Number(moduleForm.value.position),
        mcer_level: selectedLevel.value,
        is_published: moduleForm.value.is_published,
      });
    }

    isModuleSheetOpen.value = false;
    editingModuleId.value = null;
    await fetchModulesAndLessons();
  } catch (error) {
    console.error("Error al guardar el módulo:", error);
    alert("Hubo un error al procesar el módulo.");
  }
};

const deleteModule = async (modId, event) => {
  event.stopPropagation();
  activeDropdownId.value = null;
  
  if (!confirm("¿Estás seguro de eliminar este módulo? Se eliminarán también todas sus lecciones.")) return;

  try {
    const lessonsToDelete = lessonsByModule.value[modId] || [];
    for (const l of lessonsToDelete) {
      await pb.collection("lessons").delete(l.id);
    }

    await pb.collection("modules").delete(modId);
    await fetchModulesAndLessons();
  } catch (error) {
    console.error("Error al eliminar el módulo:", error);
    alert("No se pudo eliminar el módulo.");
  }
};

const moveModulePosition = async (index, direction, event) => {
  event.stopPropagation();
  activeDropdownId.value = null;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= modules.value.length) return;

  const currentMod = modules.value[index];
  const targetMod = modules.value[targetIndex];

  try {
    await pb.collection("modules").update(currentMod.id, { position: targetMod.position });
    await pb.collection("modules").update(targetMod.id, { position: currentMod.position });
    await fetchModulesAndLessons();
  } catch (error) {
    console.error("Error al reordenar módulos:", error);
  }
};

// --- CRUD LECCIONES ---

const openNewLessonSheet = (moduleId) => {
  activeModuleIdForLesson.value = moduleId;
  const currentLessons = lessonsByModule.value[moduleId] || [];
  const nextPos = currentLessons.length + 1;

  lessonForm.value = {
    title: "",
    icon: "faBookOpen",
    xp_reward: 10,
    gems_reward: 5,
    estimated_duration: 5,
    position: nextPos,
    is_published: true,
  };

  isLessonSheetOpen.value = true;
};

const selectIcon = (iconName) => {
  lessonForm.value.icon = iconName;
  isIconModalOpen.value = false;
};

const saveLesson = async () => {
  if (!activeModuleIdForLesson.value) return;

  try {
    await pb.collection("lessons").create({
      module_id: activeModuleIdForLesson.value,
      title: lessonForm.value.title,
      icon: lessonForm.value.icon, // Guardamos el icono seleccionado
      xp_reward: Number(lessonForm.value.xp_reward),
      gems_reward: Number(lessonForm.value.gems_reward),
      estimated_duration: Number(lessonForm.value.estimated_duration),
      position: Number(lessonForm.value.position),
      is_published: lessonForm.value.is_published,
    });

    isLessonSheetOpen.value = false;
    await fetchModulesAndLessons();
  } catch (error) {
    console.error("Error al guardar la lección:", error);
    alert("Hubo un error al registrar la lección.");
  }
};

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
          class=" rounded-3xl relative"
        >
          <div class="flex flex-col justify-between items-start mb-6 pb-3 border-b-2 border-slate-200 relative">
              <span class="text-xs font-black text-center text-blue-600 uppercase tracking-wider">
                Módulo {{ mod.position }}
              </span>
              <h2 class="font-black text-xl text-teal-950">{{ mod.title }}</h2>
              <p v-if="mod.description" class="text-xs font-bold text-slate-500 mt-0.5">
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
                :class="clsx('w-16 h-16 rounded-full border-b-4 text-white flex items-center justify-center shadow-md  transition-colors relative' , {
                  'bg-red-400 border-red-700 group-hover:bg-red-600': lesson.color === 'red',
                  'bg-blue-400 border-blue-700 group-hover:bg-blue-600': lesson.color === 'blue',
                  'bg-green-400 border-green-700 group-hover:bg-green-600': lesson.color === 'green',
                  'bg-yellow-400 border-yellow-700 group-hover:bg-yellow-600': lesson.color === 'yellow',
                  'bg-gray-400 border-gray-700 group-hover:bg-gray-600': !lesson.color,
                })"
              >
                <!-- Renderiza el icono dinámico guardado en la lección -->
                <FontAwesomeIcon :icon="getIconComponent(lesson.icon)" class="text-xl" />
                <span
                  class="absolute -top-1 -right-1 w-5 h-5 bg-teal-900 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white"
                >
                  {{ lesson.position }}
                </span>
              </div>
              <span class="text-xs font-black text-slate-700 mt-1 max-w-[110px] text-center truncate">
                {{ lesson.title }}
              </span>
            </div>

          </div>
        </div>

      
      </div>

     
      

      
    </div>
</template>