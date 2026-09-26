<script setup>
import clsx from 'clsx';

const props = defineProps({
    to: {
        type: String,
        default: ''
    },
    variant: {
        type: String,
        default: 'primary'
    },
    icon: {
        type: String,
        default: ''
    },
    class: {
        type: String,
        default: ''
    }
})


</script>

<template>
    <div :class="clsx({
        'bg-blue-800!': props.variant === 'primary',
        'bg-blue-800': props.variant === 'secondary',
        'bg-red-800': props.variant === 'danger'
    }, 'rounded-2xl w-fit', { 'w-full': props.class.includes('w-full') })">
        <RouterLink :to="props.to" :class="clsx(
            'px-4 py-2 rounded-2xl text-nowrap inline-flex text-base items-center justify-center gap-2 uppercase font-bold border-2 -translate-y-1 hover:translate-y-0 active:translate-y-0 transition-transform duration-150 cursor-pointer',
           {
                'bg-blue-500 text-white  border-blue-800': props.variant === 'primary',
                'bg-secondary text-blue-800  border-blue-800': props.variant === 'secondary',
                'bg-red-500 text-white border-red-800': props.variant === 'danger'
            },
            props.class
        )">
            <slot />
            <!-- Slot para el icono -->
            <slot name="icon" />
        </RouterLink>
    </div>
</template>