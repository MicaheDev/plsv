<script setup>
// Importamos las funciones necesarias de Vue y Vue Router
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Obtenemos la información de la ruta actual (URL en la que está el usuario)
const route = useRoute()

/**
 * PROPIEDAD COMPUTADA: Layout Dinámico
 * 
 * Revisa si la ruta actual definió un contenedor especial (layout) en su propiedad 'meta'.
 * - Si tiene un layout (ej. MainLayout), lo carga para envolver la vista.
 * - Si no tiene layout (ej. vistas simples de Auth u Onboarding), usa una etiqueta 'div' neutra.
 */
const currentLayout = computed(() => route.meta.layout || 'div')
</script>

<template>
  <!-- 
    <component :is="..."> es un componente dinámico de Vue.
    Renderiza el layout correspondiente (o un <div>) y dentro 
    inyecta la vista actual correspondiente a la URL mediante <RouterView />.
  -->
  <component :is="currentLayout">
    <RouterView />
  </component>
</template>