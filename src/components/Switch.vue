<script setup>
import clsx from "clsx";

// Soporta v-model nativo con booleanos (true / false)
const model = defineModel({
  type: Boolean,
  default: false,
});

const props = defineProps({
  variant: {
    type: String,
    default: "primary", // 'primary', 'studio', 'danger'
  },
  class: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <label :class="clsx('inline-flex items-center justify-between gap-4 cursor-pointer select-none w-full', props.class)">
    <!-- Label opcional por slot -->
    <span v-if="$slots.default" class="font-black text-base text-gray-800">
      <slot />
    </span>

    <!-- Contenedor del Switch -->
    <div class="relative inline-flex items-center shrink-0">
      <input 
        type="checkbox" 
        v-model="model" 
        class="sr-only peer"
      />
      <!-- Pista (Track) -->
      <div 
        :class="
          clsx(
            'w-14 h-8 rounded-full border-2 transition-colors duration-200 ease-in-out bg-gray-200 border-slate-300',
            {
              'peer-checked:bg-blue-500 peer-checked:border-blue-800': props.variant === 'primary',
              'peer-checked:bg-teal-500 peer-checked:border-teal-800': props.variant === 'studio',
              'peer-checked:bg-red-500 peer-checked:border-red-800': props.variant === 'danger',
            }
          )
        "
      ></div>
      <!-- Botón deslizante (Thumb) -->
      <div 
        :class="
          clsx(
            'absolute left-1 top-1 w-6 h-6 bg-white rounded-full border-2 border-slate-300 transition-transform duration-200 ease-in-out peer-checked:translate-x-6 shadow-sm',
            {
              'peer-checked:border-blue-800': props.variant === 'primary',
              'peer-checked:border-teal-800': props.variant === 'studio',
              'peer-checked:border-red-800': props.variant === 'danger',
            }
          )
        "
      ></div>
    </div>
  </label>
</template>