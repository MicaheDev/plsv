<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import BottomSheet from "@/components/BottomSheet.vue";
import pb from "@/services/pb";
import {
  faPlus,
  faPen,
  faTrash,
  faCopy,
  faLock,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const router = useRouter();

// Estados
const students = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const isModalOpen = ref(false);
const editingStudentId = ref(null);

// Formulario reactivo exclusivo para Estudiantes (Trainee)
const form = ref({
  fullName: "",
  username: "",
  email: "",
  password: "",
  passwordConfirm: "",
  role: "TRAINEE", // Siempre TRAINEE en esta vista
  must_change_password: true,
});

const copyCredentials = async () => {
  try {
    const textToCopy = `${form.value.password}`;
    await navigator.clipboard.writeText(textToCopy);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("No se pudo copiar al portapapeles:", err);
  }
};

// Cargar lista de aprendices/estudiantes
const fetchStudents = async () => {
  try {
    isLoading.value = true;
    // Filtramos para ver principalmente a los aprendices, o todos según prefieras
    const records = await pb.collection("users").getFullList({
      filter: 'role = "TRAINEE"',
      sort: "-created",
    });
    students.value = records;
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);
    errorMessage.value = "No se pudieron cargar los estudiantes.";
  } finally {
    isLoading.value = false;
  }
};

// Función para generar y descargar el CSV con las credenciales
const downloadCredentialsCSV = (fullName, username, password) => {
  // Cabeceras y fila con BOM (\uFEFF) para que Excel reconozca tildes y ñ correctamente
  const headers = ["Nombre Completo", "Usuario", "Contraseña Provisional", "Fecha de Creación"];
  const dateStr = new Date().toLocaleDateString("es-VE");
  const row = [
    `"${fullName.replace(/"/g, '""')}"`,
    `"${username}"`,
    `"${password}"`,
    `"${dateStr}"`
  ];

  const csvContent = "\uFEFF" + headers.join(",") + "\n" + row.join(",");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `credenciales_${username}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

onMounted(() => {
  fetchStudents();
});

// Autogenerar nombre de usuario basado en el nombre completo (ej: "Jose Perez" -> "joseperez")
const handleFullNameInput = (val) => {
  form.value.fullName = val;
  if (!editingStudentId.value) {
    form.value.username = val
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
};

// Abrir modal para Crear Estudiante
const openCreateModal = () => {
  editingStudentId.value = null;
  const tempPassword = Math.random().toString(36).slice(-8) + "Ab1!";

  form.value = {
    fullName: "",
    username: "",
    email: "",
    password: tempPassword,
    passwordConfirm: tempPassword,
    role: "TRAINEE",
    must_change_password: true,
  };
  errorMessage.value = "";
  isModalOpen.value = true;
};

// Abrir modal para Editar Estudiante
const openEditModal = (student) => {
  editingStudentId.value = student.id;
  form.value = {
    fullName: student.fullName || "",
    username: student.username || "",
    email: student.email || "",
    password: "",
    passwordConfirm: "",
    role: "TRAINEE",
    must_change_password: student.must_change_password ?? false,
  };
  errorMessage.value = "";
  isModalOpen.value = true;
};

// Guardar (Crear o Actualizar)
const handleSaveStudent = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    if (editingStudentId.value) {
      // Actualizar aprendiz existente
      const payload = {
        fullName: form.value.fullName,
        username: form.value.username,
        email: form.value.email,
        role: "TRAINEE",
        must_change_password: form.value.must_change_password,
      };

      if (form.value.password) {
        if (form.value.password !== form.value.passwordConfirm) {
          errorMessage.value = "Las contraseñas no coinciden.";
          isLoading.value = false;
          return;
        }
        payload.password = form.value.password;
        payload.passwordConfirm = form.value.passwordConfirm;
      }

      await pb.collection("users").update(editingStudentId.value, payload);
    } else {
      // Crear nuevo aprendiz con credenciales temporales
      if (form.value.password !== form.value.passwordConfirm) {
        errorMessage.value = "Las contraseñas no coinciden.";
        isLoading.value = false;
        return;
      }

      await pb.collection("users").create({
        fullName: form.value.fullName,
        username: form.value.username,
        email: form.value.email || `${form.value.username}@intranet.local`,
        password: form.value.password,
        passwordConfirm: form.value.passwordConfirm,
        role: "TRAINEE",
        must_change_password: true, // Obliga a cambiar en el primer login
        emailVisibility: true,
      });

      // Descarga automática del comprobante CSV
      downloadCredentialsCSV(
        form.value.fullName,
        form.value.username,
        form.value.password
      );
    }

    isModalOpen.value = false;
    await fetchStudents();
  } catch (error) {
    console.error("Error al guardar estudiante:", error);
    const fieldErrors = error?.response?.data || error?.data || {};

    if (fieldErrors.username?.code === "validation_not_unique") {
      errorMessage.value = `El nombre de usuario "@${form.value.username}" ya está en uso. Agrega un número o inicial para diferenciarlo.`;
    } else if (fieldErrors.email?.code === "validation_not_unique") {
      errorMessage.value = "Ese correo electrónico ya se encuentra registrado.";
    } else {
      errorMessage.value = error?.message || "Error al procesar la operación.";
    }
  } finally {
    isLoading.value = false;
  }
};

// Eliminar estudiante
const handleDeleteStudent = async (id) => {
  if (!confirm("¿Estás seguro de eliminar este estudiante del sistema?"))
    return;
  try {
    await pb.collection("users").delete(id);
    await fetchStudents();
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo eliminar el estudiante.");
  }
};

function getRole(role_name) {
  switch (role_name) {
    case "TRAINEE":
      return "APRENDIZ";
    case "ADMIN":
      return "ADMINISTRADOR";
    case "TEACHER":
      return "DOCENTE";
    default:
      return "INVITADO";
  }
}
</script>

<template>
  <!-- Header del Panel -->
  <header
    class="w-full max-w-2xl mx-auto px-6 flex items-center justify-between border-b border-slate-200 h-16 bg-white sticky top-0"
  >
    <div class="flex items-center gap-3">
      <div>
        <span
          class="text-[10px] font-black text-teal-600 uppercase tracking-wider"
          >Adminitrar</span
        >
        <h1
          class="font-black text-sm text-teal-950 truncate max-w-[200px] sm:max-w-md"
        >
          Aprendices del Sistema
        </h1>
      </div>
    </div>
  </header>

  <!-- Lista de Estudiantes -->
  <div
    class="w-full flex px-4 gap-4 flex-col overflow-y-auto max-w-2xl mx-auto h-full pb-24"
  >
    <div class="flex py-2 items-center justify-between">
      <h2 class="font-black text-teal-950">Lista de Aprendices</h2>
      <Button @click="openCreateModal" variant="studio">
        <FontAwesomeIcon :icon="faPlus" />
      </Button>
    </div>
    <div
      v-for="student in students"
      :key="student.id"
      class="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-teal-500 transition-colors"
    >
      <div class="space-y-1.5 min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <h3 class="font-black text-teal-950 text-base truncate max-w-full">
            {{ student.fullName || "Sin nombre" }}
          </h3>
          <span
            class="text-[10px] font-black px-2.5 py-0.5 rounded-full border-2 bg-slate-200 text-slate-700 border-slate-300 shrink-0"
          >
            {{ getRole(student.role) }}
          </span>
          <span
            v-if="student.must_change_password"
            class="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full shrink-0"
            title="Debe cambiar contraseña y usuario en su primer inicio de sesión"
          >
            Credenciales Temporales
          </span>
        </div>

        <div
          class="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-xs font-bold text-slate-500"
        >
          <span class="truncate">
            Usuario:
            <span class="text-teal-700 font-black"
              >@{{ student.username }}</span
            >
          </span>
          <span class="hidden sm:inline text-slate-300">|</span>
          <span class="truncate"> Email: {{ student.email || "N/A" }} </span>
        </div>
      </div>

      <!-- Acciones: ancho completo en móvil para toque cómodo, compacto en desktop -->
      <div
        class="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/80 shrink-0"
      >
        <button
          @click="openEditModal(student)"
          class="flex-1 sm:flex-initial h-9 px-3 sm:px-0 sm:w-9 rounded-xl bg-white border-2 border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700 flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer active:scale-95"
          title="Editar aprendiz"
        >
          <FontAwesomeIcon :icon="faPen" />
          <span class="sm:hidden">Editar</span>
        </button>
        <button
          @click="handleDeleteStudent(student.id)"
          class="flex-1 sm:flex-initial h-9 px-3 sm:px-0 sm:w-9 rounded-xl bg-white border-2 border-slate-200 text-red-500 hover:border-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer active:scale-95"
          title="Eliminar aprendiz"
        >
          <FontAwesomeIcon :icon="faTrash" />
          <span class="sm:hidden">Eliminar</span>
        </button>
      </div>
    </div>

    <div
      v-if="students.length === 0 && !isLoading"
      class="text-center py-12 text-slate-400 font-bold"
    >
      No hay estudiantes registrados en el sistema.
    </div>
  </div>

  <!-- BottomSheet para Registrar / Editar Estudiante -->
  <BottomSheet
    v-model="isModalOpen"
    :title="editingStudentId ? 'Editar Aprendiz' : 'Añadir Nuevo Aprendiz'"
  >
    <form @submit.prevent="handleSaveStudent" class="space-y-4">
      <Input
        type="text"
        :model-value="form.fullName"
        @update:model-value="handleFullNameInput"
        minlength="3"
        required
        variant="studio"
        placeholder="Jose Perez"
      >
        Nombre completo
      </Input>

      <Input
        type="text"
        v-model="form.username"
        minlength="3"
        required
        variant="studio"
        placeholder="joseperez"
        autocomplete="username"
      >
        Nombre de usuario (Autogenerado)
      </Input>

      <!-- Bloque de Contraseña Provisional -->
      <div
  v-if="!editingStudentId"
  class="p-4 rounded-2xl bg-teal-50/70 border-2 border-teal-200 flex items-center justify-between gap-3"
>
  <div class="flex items-center gap-2.5 min-w-0">
    <div class="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
      <FontAwesomeIcon :icon="faLock" class="text-sm" />
    </div>
    <div class="min-w-0">
      <p class="text-xs font-black text-teal-950">Contraseña temporal generada</p>
      <p class="text-[11px] font-bold text-slate-500 truncate">
        Oculta por seguridad • Se pedirá cambio al entrar
      </p>
    </div>
  </div>

  <button
    type="button"
    @click="copyCredentials"
    :class="[
      'px-3.5 py-2 rounded-xl text-xs font-black border-2 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95',
      copied
        ? 'bg-emerald-500 text-white border-emerald-600'
        : 'bg-white text-teal-800 border-teal-300 hover:border-teal-600'
    ]"
  >
    <FontAwesomeIcon :icon="copied ? faCheck : faCopy" />
    <span>{{ copied ? "Copiado" : "Copiar" }}</span>
  </button>
</div>

      <div
        v-if="errorMessage"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm font-bold"
      >
        {{ errorMessage }}
      </div>

      <div class="pt-2">
        <Button
          type="submit"
          variant="studio"
          class="w-full"
          :disabled="isLoading"
        >
          {{
            isLoading
              ? "Guardando..."
              : editingStudentId
                ? "Actualizar Aprendiz"
                : "Crear Aprendiz"
          }}
        </Button>
      </div>
    </form>
  </BottomSheet>
</template>
