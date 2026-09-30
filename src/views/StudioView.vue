<script setup>
import Button from "@/components/Button.vue";
import Modal from "@/components/Modal.vue";
import Select from "@/components/Select.vue";
import pb from "@/services/pb";
import { formatPocketBaseError } from "@/utilities/errorMapper";
import { PhDotsThreeVertical, PhPlus } from "@phosphor-icons/vue";
import { ref } from "vue";
import { reactive } from "vue";

const form = reactive({
  SelectedLevel: "",
});
const isLoading = ref(false);
const errorMessage = ref("");

const sections = ref([]);

const showSectionModalAdd = ref(false)

const options = [
  {
    label: "Nivel A1",
    value: "a1",
  },
  {
    label: "Nivel A2",
    value: "a2",
  },
  {
    label: "Nivel B1",
    value: "b1",
  },
  {
    label: "Nivel B2",
    value: "b2",
  },
];

async function handleOnSubmit() {
  isLoading.value = true;

  try {
    const resultList = await pb.collection("sections").getList(1, 50, {
      filter: `level = "${form.SelectedLevel.toUpperCase()}"`
    });

    sections.value = resultList.items;
  } catch (error) {
    errorMessage.value =
      formatPocketBaseError(error.message) || "Error al iniciar sesión.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="w-full min-h-full p-6 flex flex-col gap-6 max-w-2xl mx-auto">
    <Select
      @change="handleOnSubmit"
      variant="studio"
      class="w-min"
      v-model="form.SelectedLevel"
      :options="options"
    >
      Niveles Disponibles
    </Select>

    <div class="flex flex-col gap-2" v-if="form.SelectedLevel != ''">
      <h2 class="font-black">Secciones</h2>

      <hr class="border-slate-300" />
      <Button variant="studio" @click="showSectionModalAdd = true">
        Agregar Sección

        <template #icon>
          <PhPlus :size="25" />
        </template>
      </Button>
      <hr class="border-slate-300" />

      <div v-if="sections.length > 0" class="flex flex-col gap-2">
        <div v-for="(section, index) in sections" class="py-2 border-b-2 border-dashed flex items-center justify-between border-slate-300">
          <h4>Seccion {{ index + 1 }}: {{ section.title }}</h4>

          <button class="w-10 h-10 inline-flex justify-center items-center">
            <PhDotsThreeVertical :size="25" />
          </button>
        </div>
        
      </div>
      <p v-else>No hay secciones</p>
    </div>
    <p v-else class="text-sm max-lg:text-center">
      Seleccione un nivel para empezar por favor...
    </p>
  </div>
  <Modal v-model="showSectionModalAdd">
    hola mundo
  </Modal>
</template>
