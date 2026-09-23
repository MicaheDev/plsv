<script setup>
import { PhBookBookmark, PhCrownSimple, PhHouseLine, PhStorefront, PhUserGear } from '@phosphor-icons/vue';

const links = [
    {
        path: "/learning",
        icon: PhHouseLine,
        label: "Inicio"
    },
    {
        path: "/dictionary",
        icon: PhBookBookmark,
        label: "Diccionario"
    },
    {
        path: "/ranking",
        icon: PhCrownSimple,
        label: "Ranking"
    },
    {
        path: "/store",
        icon: PhStorefront,
        label: "Tienda"
    }, {
        path: "/profile",
        icon: PhUserGear,
        label: "Perfil"
    }
]
</script>

<template>
    <nav
        class=" flex flex-col gap-2 max-lg:flex-row w-75 border-r-2 border-stroke p-4 max-lg:h-20 max-lg:items-center max-lg:justify-between max-lg:w-full max-lg:border-0 max-lg:border-t-2 h-full max-lg:flex max-lg:shrink-0">
        <RouterLink to="/" class="inline-flex items-center gap-2 max-lg:hidden mb-2">
            <img src="/logo.png" class="w-12" />
            <h1 class="font-black text-xl">LinguSeñas</h1>
        </RouterLink>

        <RouterLink v-for="link in links" :key="link.path" :to="link.path"
            class="px-4 py-1 max-lg:p-2.5 rounded-2xl text-nowrap border-2 border-transparent inline-flex text-base max-lg:w-auto w-full items-center max-lg:justify-center gap-2 uppercase font-bold text-fg-muted hover:text-fg cursor-pointer"
            active-class="bg-primary hover:text-white text-primary-fg border-primary-hover!">
            <component :is="link.icon" :size="32" />
            <span class="max-lg:hidden">{{ link.label }}</span>
        </RouterLink>
    </nav>
</template>