<script setup>
import Button from "@/components/Button.vue";
import LinkButton from "@/components/LinkButton.vue";
import pb from "@/services/pb";
import { fechaFormateada } from "@/utilities/formatDate";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const currentUser = ref(pb.authStore.record);

function logout() {
  pb.authStore.clear();
  router.push("/login");
}

function getRole(role_name) {
  switch (role_name) {
    case "STUDENT":
      return "ESTUDIANTE";
    case "ADMIN":
      return "ADMINISTRADOR";
    case "TEACHER":
      return "DOCENTE";
    case "GUEST":
      return "INVITADO";
    default:
      return "INVITADO";
  }
}
</script>

<template>
  <div class="w-full min-h-full p-6 flex flex-col gap-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-black text-slate-800">Mi Perfil</h1>

    <!-- Tarjeta Principal de Cabecera -->
    <div class="w-full max-lg:gap-2 bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center justify-between gap-4 max-lg:flex-col">
      <div class="flex items-center max-lg:flex-col gap-4 overflow-hidden">
        <figure
          class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl uppercase shrink-0"
        >
          {{ currentUser?.username?.[0] || 'U' }}
        </figure>
        <div class="flex flex-col overflow-hidden">
          <h2 class="text-xl font-bold text-slate-800 truncate">
            {{ currentUser?.full_name || currentUser?.username }}
          </h2>
          <span class="text-sm font-semibold text-slate-400 truncate max-lg:text-center">
            @{{ currentUser?.username }}
          </span>
        </div>
      </div>

      <!-- Badge de Rol -->
      <span
        class="text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider text-white shrink-0"
        :class="{
          'bg-blue-600': currentUser?.role === 'STUDENT',
          'bg-black': currentUser?.role === 'ADMIN',
          'bg-emerald-600': currentUser?.role === 'TEACHER',
          'bg-slate-500': !['STUDENT', 'ADMIN', 'TEACHER'].includes(currentUser?.role)
        }"
      >
        {{ getRole(currentUser?.role) }}
      </span>
    </div>

    <!-- Detalles del Usuario -->
    <div class="w-full bg-white border-2 border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
      <h3 class="text-lg font-bold text-slate-700">Información Personal</h3>

      <hr class="border-slate-200" />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Correo Electrónico -->
        <div class="flex flex-col">
          <span class="text-xs font-bold uppercase text-slate-400">Correo Electrónico</span>
          <span class="font-bold text-slate-800 truncate">{{ currentUser?.email }}</span>
        </div>

        <!-- Nombre de Usuario -->
        <div class="flex flex-col">
          <span class="text-xs font-bold uppercase text-slate-400">Nombre de Usuario</span>
          <span class="font-bold text-slate-800 truncate">@{{ currentUser?.username }}</span>
        </div>

        <!-- Fecha de Registro -->
        <div class="flex flex-col">
          <span class="text-xs font-bold uppercase text-slate-400">Miembro Desde</span>
          <span class="font-bold text-slate-800">
            {{ fechaFormateada(currentUser?.created) }}
          </span>
        </div>

        <!-- Rol asignado -->
        <div class="flex flex-col">
          <span class="text-xs font-bold uppercase text-slate-400">Rol de Sistema</span>
          <span class="font-bold text-slate-800">{{ getRole(currentUser?.role) }}</span>
        </div>
      </div>
    </div>

    <!-- Opciones de Cuenta y Administración -->
    <div class="w-full bg-white border-2 border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
      <h3 class="text-lg font-bold text-slate-700">Cuenta y Seguridad</h3>

      <hr class="border-slate-200" />

      <!-- Modo Studio (Solo para Admin o Docente) -->
      <template v-if="currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER'">
        <div class="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start">
          <div>
            <p class="font-bold text-slate-800">Modo Studio</p>
            <p class="text-sm font-medium text-slate-400">Accede al panel de gestión e impartición de contenidos.</p>
          </div>
          <LinkButton
            to="/studio"
            variant="secondary"
            class="shrink-0"
          >
            Ir a Studio
          </LinkButton>
        </div>

        <hr class="border-slate-200" />
      </template>

      <!-- Cerrar Sesión -->
      <div class="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start">
        <div>
          <p class="font-bold text-slate-800">Cerrar Sesión</p>
          <p class="text-sm font-medium text-slate-400">Sal de tu cuenta actual de forma segura.</p>
        </div>
        <Button  variant="danger" class="shrink-0" @click="logout">
          Cerrar Sesión
        </Button>
      </div>
    </div>
  </div>
</template>