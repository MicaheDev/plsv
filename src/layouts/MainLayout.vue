<script setup>
import Header from '@/components/Header.vue';
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
        label: "Diccionario"
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
    <div class="w-full h-svh flex flex-row-reverse max-lg:flex-col">
        <div class="w-full h-full flex flex-row-reverse max-lg:flex-col justify-center">
            <Header />
            <main class="w-full max-w-2xl h-full max-lg:max-w-0">
                <slot></slot>
            </main>
        </div>
        <nav
            class="w-75 border-r-2 border-stroke p-4 max-lg:h-20 max-lg:items-center max-lg:justify-between max-lg:w-full max-lg:border-0 max-lg:border-t-2 h-full max-lg:flex max-lg:shrink-0">

            <RouterLink v-for="link in links" :key="link.path" :to="link.path"
                class="p-2.5 rounded-2xl text-nowrap inline-flex text-base max-lg:w-auto w-full items-center max-lg:justify-center gap-2 uppercase font-bold text-fg-muted hover:text-fg transition-all duration-150 cursor-pointer"
                active-class="bg-primary text-primary-fg border-2 border-primary-hover shadow-md -translate-y-0.5">
                <component :is="link.icon" :size="32" />
                <span class="max-lg:hidden">{{ link.label }}</span>
            </RouterLink>
        </nav>
    </div>
</template>