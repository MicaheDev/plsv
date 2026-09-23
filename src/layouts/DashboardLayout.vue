<script setup>
import Header from '@/components/Header.vue';
import Menu from '@/components/Menu.vue';
</script>

<template>
    <div class="w-full h-svh flex flex-row-reverse max-lg:flex-col">
        <div class="w-full h-full flex flex-row-reverse max-lg:flex-col justify-center">
            <Header />
            <main class="w-full max-w-2xl h-full max-lg:max-w-none">
                <slot></slot>
            </main>
        </div>
        <Menu/>
    </div>
</template>