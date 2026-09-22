<script setup>
import Header from '@/components/Header.vue';

</script>

<template>
    <div class="w-full h-svh flex max-lg:flex-col overflow-hidden">
        <Header/>
        <main class="w-full h-full flex-1 overflow-y-auto">
            <slot></slot>
        </main>
    </div>
</template>