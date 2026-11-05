<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import Modal from "@/components/Modal.vue";
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
  <header class="w-fit px-4 flex border-gray-300 h-18 max-lg:shrink-0 max-lg:w-full max-lg:bg-white">
    <Select
      v-model="selectedLevel"
      :options="levelOptions"
      variant="studio"
      class="text-center text-xs! font-black"
    >
      Nivel de la ruta
    </Select>
  </header>
  <main class="w-full overflow-hidden overflow-y-auto max-w-2xl h-full max-lg:max-w-none">
    <div class="w-full mx-auto p-4 space-y-6 bg-white min-h-screen pb-24">
      <!-- Lista Vertical de Módulos -->
      <div class="space-y-10">
        <div
          v-for="(mod, mIndex) in modules"
          :key="mod.id"
          class="p-5 rounded-3xl border-2 border-slate-200 bg-slate-50 relative shadow-sm"
        >
          <!-- Encabezado del Módulo con Dropdown de Opciones -->
          <div class="flex justify-between items-start mb-6 pb-3 border-b-2 border-slate-200 relative">
            <div>
              <span class="text-xs font-black text-teal-600 uppercase tracking-wider">
                Módulo {{ mod.position }}
              </span>
              <h2 class="font-black text-xl text-teal-950">{{ mod.title }}</h2>
              <p v-if="mod.description" class="text-xs font-bold text-slate-500 mt-0.5">
                {{ mod.description }}
              </p>
            </div>

            <!-- Botón 3 Puntos (Dropdown Toggle) -->
            <div class="relative">
              <button
                @click.stop="toggleDropdown(mod.id, $event)"
                class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon :icon="faEllipsisVertical" class="text-lg" />
              </button>

              <!-- Menú Desplegable -->
              <div
                v-if="activeDropdownId === mod.id"
                class="absolute right-0 mt-2 w-48 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-30 py-2 space-y-1"
              >
                <button
                  @click="openEditModuleSheet(mod, $event)"
                  class="w-full px-4 py-2 text-left text-xs font-black text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon :icon="faPen" /> Editar Módulo
                </button>

                <button
                  v-if="mIndex > 0"
                  @click="moveModulePosition(mIndex, 'up', $event)"
                  class="w-full px-4 py-2 text-left text-xs font-black text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon :icon="faArrowUp" /> Mover Arriba
                </button>

                <button
                  v-if="mIndex < modules.length - 1"
                  @click="moveModulePosition(mIndex, 'down', $event)"
                  class="w-full px-4 py-2 text-left text-xs font-black text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon :icon="faArrowDown" /> Mover Abajo
                </button>

                <div class="border-t border-slate-100 my-1"></div>

                <button
                  @click="deleteModule(mod.id, $event)"
                  class="w-full px-4 py-2 text-left text-xs font-black text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <FontAwesomeIcon :icon="faTrash" /> Eliminar Módulo
                </button>
              </div>
            </div>
          </div>

          <!-- Ruta en Zigzag de Lecciones -->
          <div class="flex flex-col items-center gap-6 my-4 py-2">
            <div
              v-for="(lesson, lIndex) in lessonsByModule[mod.id] || []"
              :key="lesson.id"
              :style="getZigzagStyle(lIndex)"
              @click="goToLessonDetail(lesson.id)"
              class="group flex flex-col items-center cursor-pointer transition-transform active:scale-95"
            >
              <div
                class="w-16 h-16 rounded-full bg-teal-500 border-b-4 border-teal-700 text-white flex items-center justify-center shadow-md group-hover:bg-teal-600 transition-colors relative"
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

            <!-- Placeholder de Lección (+ Agregar Lección) -->
            <div
              :style="getZigzagStyle((lessonsByModule[mod.id] || []).length)"
              @click="openNewLessonSheet(mod.id)"
              class="flex flex-col items-center cursor-pointer transition-transform active:scale-95 group"
            >
              <div
                class="w-16 h-16 rounded-full border-4 border-dashed border-teal-400/60 bg-teal-50/50 text-teal-600 flex items-center justify-center group-hover:border-teal-500 group-hover:bg-teal-100/50 transition-all"
              >
                <FontAwesomeIcon :icon="faPlus" class="text-2xl opacity-70 group-hover:opacity-100" />
              </div>
              <span class="text-xs font-black text-teal-600/70 group-hover:text-teal-700 mt-1">
                + Lección
              </span>
            </div>
          </div>
        </div>

        <!-- Placeholder transparente de Módulo (+ Agregar Módulo) -->
        <div
          @click="openNewModuleSheet"
          class="p-6 rounded-3xl border-4 border-dashed border-slate-300/80 bg-slate-50/40 hover:bg-slate-100/60 hover:border-teal-500/60 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group text-center"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-teal-100/60 text-teal-700 flex items-center justify-center border-2 border-teal-300/60 group-hover:scale-110 transition-transform"
          >
            <FontAwesomeIcon :icon="faPlus" class="text-2xl" />
          </div>
          <span class="font-black text-slate-500 group-hover:text-teal-900 transition-colors">
            Agregar Nuevo Módulo en {{ selectedLevel.toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- BottomSheet: Crear / Editar Módulo -->
      <Modal v-model="isModuleSheetOpen" :title="editingModuleId ? 'Editar Módulo' : 'Nuevo Módulo'">
        <form @submit.prevent="saveModule" class="space-y-4">
          <Input
            v-model="moduleForm.title"
            variant="studio"
            placeholder="Ej. Saludos y Presentaciones"
            required
          >
            Título del Módulo
          </Input>

          <div class="flex flex-col gap-2 w-full">
            <label class="font-black text-teal-900 text-sm">Descripción</label>
            <textarea
              v-model="moduleForm.description"
              rows="2"
              class="px-4 py-2 resize-none rounded-2xl w-full text-base font-bold border-2 border-slate-200 bg-gray-50 focus:border-teal-600 focus:outline-none transition-colors"
              placeholder="Breve resumen del contenido..."
            ></textarea>
          </div>

          <Input
            v-model="moduleForm.position"
            type="number"
            variant="studio"
            min="1"
            required
          >
            Orden de Posición
          </Input>

          <Switch v-model="moduleForm.is_published" variant="studio">
            ¿Publicar Módulo?
          </Switch>

          <div class="pt-4">
            <Button type="submit" variant="studio" class="w-full">
              {{ editingModuleId ? 'Actualizar Módulo' : 'Crear Módulo' }}
            </Button>
          </div>
        </form>
      </Modal>

      <!-- BottomSheet: Crear Lección -->
      <Modal v-model="isLessonSheetOpen" title="Nueva Lección">
        <form @submit.prevent="saveLesson" class="space-y-4">
          <Input
            v-model="lessonForm.title"
            variant="studio"
            placeholder="Ej. Señas de Buenos Días"
            required
          >
            Título de la Lección
          </Input>

          <!-- Selector de Icono con Modal -->
          <div class="flex flex-col gap-2 w-full">
            <label class="font-black text-teal-900 text-sm">Icono de la Lección</label>
            <button
              type="button"
              @click="isIconModalOpen = true"
              class="px-4 py-3 rounded-2xl w-full border-2 border-slate-200 bg-gray-50 hover:border-teal-600 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                  <FontAwesomeIcon :icon="getIconComponent(lessonForm.icon)" class="text-lg" />
                </div>
                <span class="font-bold text-slate-700">{{ lessonForm.icon }}</span>
              </div>
              <span class="text-xs font-black text-teal-700 bg-teal-100 px-3 py-1.5 rounded-xl">Cambiar Icono</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <Input
              v-model="lessonForm.xp_reward"
              type="number"
              variant="studio"
              min="0"
              required
            >
              <FontAwesomeIcon :icon="faStar" class="text-amber-500 mr-1" /> XP Recompensa
            </Input>

            <Input
              v-model="lessonForm.gems_reward"
              type="number"
              variant="studio"
              min="0"
              required
            >
              <FontAwesomeIcon :icon="faGem" class="text-cyan-500 mr-1" /> Gemas
            </Input>
          </div>

          <Input
            v-model="lessonForm.estimated_duration"
            type="number"
            variant="studio"
            min="1"
            required
          >
            <FontAwesomeIcon :icon="faClock" class="text-teal-600 mr-1" /> Duración (Minutos)
          </Input>

          <Input
            v-model="lessonForm.position"
            type="number"
            variant="studio"
            min="1"
            required
          >
            Orden dentro del Módulo
          </Input>

          <Switch v-model="lessonForm.is_published" variant="studio">
            ¿Publicar Lección?
          </Switch>

          <div class="pt-4">
            <Button type="submit" variant="studio" class="w-full">
              Crear Lección
            </Button>
          </div>
        </form>
      </Modal>

      <!-- Modal Interno: Selección de Icono -->
      <Modal v-model="isIconModalOpen" title="Seleccionar Icono">
        <div class="grid grid-cols-3 gap-3 py-2">
          <div
            v-for="item in availableIcons"
            :key="item.name"
            @click="selectIcon(item.name)"
            :class="[
              'p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
              lessonForm.icon === item.name
                ? 'border-teal-600 bg-teal-50 text-teal-800 scale-105 shadow-sm'
                : 'border-slate-200 bg-gray-50 text-slate-600 hover:border-teal-300 hover:bg-slate-100',
            ]"
          >
            <div class="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center text-xl">
              <FontAwesomeIcon :icon="item.icon" />
            </div>
            <span class="text-xs font-black">{{ item.label }}</span>
          </div>
        </div>
      </Modal>
    </div>
  </main>
</template>