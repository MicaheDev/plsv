<script setup>
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import pb from "@/services/pb";
import { formatPocketBaseError } from "@/utilities/errorMapper";
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref("");

const currentUser = pb.authStore.model;

const form = reactive({
  username: currentUser?.username || "",
  newPassword: "",
  passwordConfirm: "",
});

onMounted(() => {
  // Si no hay sesión o ya activó su cuenta, redirigir
  if (!pb.authStore.isValid) {
    router.push("/login");
  } else if (!currentUser?.must_change_password) {
    router.push("/learning");
  }
});

async function handleActivate() {
  isLoading.value = true;
  errorMessage.value = "";

  if (form.newPassword !== form.passwordConfirm) {
    errorMessage.value = "Las contraseñas nuevas no coinciden.";
    isLoading.value = false;
    return;
  }

  if (form.newPassword.length < 4) {
    errorMessage.value = "La contraseña debe tener al menos 4 caracteres.";
    isLoading.value = false;
    return;
  }

  const oldPassword = sessionStorage.getItem("temp_old_pass");

  try {
    // 1. Actualizar usuario, contraseña definitiva y desactivar bandera
    await pb.collection("users").update(currentUser.id, {
      username: form.username.trim().toLowerCase(),
      oldPassword: oldPassword, // Requerido por PocketBase para cambiar clave propia
      password: form.newPassword,
      passwordConfirm: form.passwordConfirm,
      must_change_password: false,
    });

    // 2. Re-autenticar silenciosamente porque PocketBase invalida el token al cambiar password
    await pb
      .collection("users")
      .authWithPassword(form.username.trim().toLowerCase(), form.newPassword);

    // 3. Limpiar clave temporal y enviar a aprender
    sessionStorage.removeItem("temp_old_pass");
    router.push("/learning");
  } catch (error) {
    console.error("Error al activar cuenta:", error);
    errorMessage.value =
      formatPocketBaseError(error.message) ||
      "No se pudo actualizar los datos. Verifica que el usuario no esté en uso.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-center items-center max-w-2xl mx-auto p-4"
  >
    <form
      @submit.prevent="handleActivate"
      class="w-full h-full flex flex-col justify-center max-lg:justify-between gap-4"
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <span
            class="text-xs font-black text-blue-600 uppercase tracking-wider text-center"
          >
            Primer ingreso
          </span>
          <h1 class="text-3xl font-black text-center">Configura tu cuenta</h1>
          <p class="text-gray-500 font-medium text-center text-sm">
            Hola <span class="font-bold text-slate-700">{{ currentUser?.fullName }}</span>, personaliza tu usuario y crea una contraseña segura para continuar.
          </p>
        </div>

        <!-- Nombre de Usuario definitivo -->
        <Input
          type="text"
          v-model="form.username"
          minlength="3"
          required
          placeholder="Ej: joseperez"
          autocomplete="username"
        >
          Tu nombre de usuario
        </Input>

        <!-- Nueva Contraseña -->
        <Input
          type="password"
          v-model="form.newPassword"
          minlength="4"
          required
          placeholder="Mínimo 4 caracteres"
          autocomplete="new-password"
        >
          Nueva contraseña
        </Input>

        <!-- Confirmar Nueva Contraseña -->
        <Input
          type="password"
          v-model="form.passwordConfirm"
          minlength="4"
          required
          placeholder="Repite tu contraseña"
          autocomplete="new-password"
        >
          Confirmar contraseña
        </Input>

        <div
          v-if="errorMessage"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm font-bold"
        >
          {{ errorMessage }}
        </div>
      </div>

      <div class="w-full flex flex-row gap-3 max-lg:flex-col justify-center">
        <Button class="w-full" type="submit" variant="primary" :disabled="isLoading">
          {{ isLoading ? "Guardando..." : "Guardar y Comenzar" }}
        </Button>
      </div>
    </form>
  </div>
</template>