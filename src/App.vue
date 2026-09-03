<script setup>

import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Si la ruta tiene un layout en 'meta', lo usa. 
// Si no (como en "/" o "/login"), muestra directamente la página.
const currentLayout = computed(() => route.meta.layout || 'div')
</script>

<template>
    <component :is="currentLayout">
        <RouterView />
    </component>
</template>