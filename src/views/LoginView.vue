<script setup>
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import LinkButton from "@/components/LinkButton.vue";
import pb from "@/services/pb";
import { formatPocketBaseError } from "@/utilities/errorMapper";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const isLoading = ref(false);
const errorMessage = ref("");

const router = useRouter();

const form = reactive({
  identity: "",
  password: "",
});

async function handleOnSubmit() {
  isLoading.value = true;

  try {
    await pb.collection("users").authWithPassword(form.identity, form.password);

    router.push("/learning");
  } catch (error) {
    errorMessage.value =
      formatPocketBaseError(error.message) || "Error al iniciar sesión.";
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
      @submit.prevent="handleOnSubmit"
      class="w-full h-full flex flex-col justify-center max-lg:justify-between gap-4"
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-black text-center">Iniciar sesión</h1>
          <p class="text-gray-500 font-medium text-center text-sm">
            Bienvenido de vuelta. Por favor, ingresa tus credenciales.
          </p>
        </div>
        <!-- Input de Identidad (Username o E-mail) -->
        <Input
          type="text"
          v-model="form.identity"
          required
          placeholder="pedrito o pedrito@gmail.com"
          autocomplete="username"
        >
          Usuario o E-mail
        </Input>

        <!-- Input para Contraseña -->
        <Input
          type="password"
          v-model="form.password"
          required
          placeholder="••••••••"
        >
          Contraseña
        </Input>
        <div
          v-if="errorMessage"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm"
        >
          {{ errorMessage }}
        </div>
      </div>

      <div class="w-full flex flex-row gap-3 max-lg:flex-col justify-center">
        <Button class="w-full" type="submit" variant="primary">
          {{ isLoading ? "Accediendo..." : "Acceder" }}
        </Button>

        <LinkButton class="w-full" variant="secondary" to="/register">
          Crear una cuenta
        </LinkButton>
      </div>
    </form>
  </div>
</template>
