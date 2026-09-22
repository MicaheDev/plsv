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
    <div :class="clsx('bg-primary-hover rounded-2xl w-fit', {'w-full': props.class.includes('w-full')})">
        <RouterLink :to="props.to" :class="clsx(
            'px-4 py-2 rounded-2xl text-nowrap inline-flex text-base items-center justify-center gap-2 uppercase font-bold border-2 -translate-y-1 hover:translate-y-0 active:translate-y-0 transition-transform duration-150 cursor-pointer',
            {
                'bg-primary text-primary-fg  border-primary-hover': props.variant === 'primary',
                'bg-secondary text-secondary-fg  border-secondary-hover': props.variant === 'secondary'
            },
            props.class
        )" >
            <slot />
            <!-- Slot para el icono -->
            <slot name="icon" />
        </RouterLink>
    </div>
</template>