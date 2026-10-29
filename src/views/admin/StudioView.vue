<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import Modal from "@/components/Modal.vue";
import Switch from "@/components/Switch.vue";
import pb from "@/services/pb";
import {
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const router = useRouter();

// Estados
const modules = ref([]);
const isBottomSheetOpen = ref(false);

// Estado del formulario para el nuevo módulo
const moduleForm = ref({
  title: "",
  description: "",
  position: 1,
  published: true,
  mcar_level: "",
});

const levelOptions = [
  { label: "A1", value: "a1" },
  { label: "A2", value: "a2" },
  { label: "B1", value: "b1" },
  { label: "B2", value: "b2" },
  { label: "C1", value: "c1" },
  { label: "C2", value: "c2" },
];

// 1. Cargar módulos existentes al iniciar la vista
const fetchModules = async () => {
  try {
    const records = await pb.collection("modules").getFullList({
      sort: "position",
    });
    modules.value = records;
  } catch (error) {
    console.error("Error al cargar los módulos:", error);
  }
};

onMounted(() => {
  fetchModules();
});

// 2. Guardar nuevo módulo y actualizar la vista
const saveModule = async () => {
  try {
    await pb.collection("modules").create({
      title: moduleForm.value.title,
      description: moduleForm.value.description,
      position: Number(moduleForm.value.position),
      mcer_level: moduleForm.value.mcar_level,
      is_published: moduleForm.value.published,
    });

    // Limpiar formulario, cerrar sheet y recargar lista
    moduleForm.value = {
      title: "",
      description: "",
      position: 1,
      mcar_level: "",
    };
    isBottomSheetOpen.value = false;
    await fetchModules();
  } catch (error) {
    console.error("Error al guardar el módulo:", error);
    alert("Hubo un error al registrar el módulo.");
  }
};

// 3. Navegar al detalle del módulo seleccionado
const goToModuleDetail = (id) => {
  router.push(`/studio/module/${id}`); // Ajusta la ruta de tu router según corresponda
};
</script>

<template>
  <div class="max-w-full mx-auto p-6 space-y-6 bg-white min-h-screen">
    <h1 class="text-xl font-black text-teal-900 uppercase">
      Modulos de Aprendizaje
    </h1>

    <!-- Botón para abrir el BottomSheet de Crear Módulo -->
    <Button  variant="studio" class="w-full" @click="isBottomSheetOpen = true">
      <span>Nuevo Módulo</span>

      <template #icon>
        <FontAwesomeIcon :icon="faPlus" class="text-xl" />
      </template>
    </Button>

    <!-- Lista de Módulos Existentes -->
    <div class="space-y-4 pt-4">
      <h2 class="font-bold text-gray-700">Modulos Disponibles</h2>

      <div
        v-for="mod in modules"
        :key="mod.id"
        @click="goToModuleDetail(mod.id)"
        class="p-4 rounded-2xl border-2 border-slate-200 bg-gray-50 hover:border-teal-500 cursor-pointer transition-colors flex justify-between items-center"
      >
        <div>
          <h3 class="font-black text-teal-900"> # {{ mod.position }} - {{ mod.title }}</h3>
          <p class="text-xs font-bold text-gray-500 uppercase">
            {{ mod.description }}
          </p>
            <p class="text-xs font-bold text-gray-500 uppercase">
            Nivel: {{ mod.mcer_level }}
          </p>
              <p class="text-xs font-bold text-gray-500 uppercase">
            
          </p>
        </div>
      </div>

      <p
        v-if="modules.length === 0"
        class="text-sm text-gray-500 text-center py-4"
      >
        No hay modulos registrados aún.
      </p>
    </div>

    <!-- Bottom Sheet con el Formulario -->
    <Modal v-model="isBottomSheetOpen" title="Agregar Nuevo Modulo">
      <form @submit.prevent="saveModule" class="space-y-4">
        <Input
          v-model="moduleForm.title"
          variant="studio"
          placeholder="Ej. Saludos Básicos"
          required
        >
          Título del Módulo
        </Input>

        <div class="flex flex-col gap-2 w-full">
          <label class="font-black text-teal-900 text-sm">Descripción</label>
          <textarea
            v-model="moduleForm.description"
            rows="3"
            class="px-4 py-2 rounded-2xl w-full text-base font-bold border-2 border-slate-200 bg-gray-50 focus:border-teal-600 focus:outline-none transition-colors"
            placeholder="Breve descripción..."
          ></textarea>
        </div>

        <Input
          v-model="moduleForm.position"
          type="number"
          variant="studio"
          min="1"
          required
        >
          Orden
        </Input>

        <Select
          v-model="moduleForm.mcar_level"
          :options="levelOptions"
          variant="studio"
          required
        >
          Nivel MCER
        </Select>

        <Switch v-model="moduleForm.published" variant="studio">
          ¿Publicar Modulo?
        </Switch>

        <div class="pt-4">
          <Button type="submit" variant="studio" class="w-full">
            Guardar Módulo
          </Button>
        </div>
      </form>
    </Modal>
  </div>
</template>
