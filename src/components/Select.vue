<script setup>
import clsx from "clsx";

// Habilita el soporte nativo para v-model en Vue 3.4+
const model = defineModel({
  type: [String, Number],
  default: "",
});

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  variant: {
    type: String,
    default: "primary",
  },
  class: {
    type: String,
    default: "",
  },
});

defineOptions({
  inheritAttrs: false,
});
const emit = defineEmits(["change"]);

</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <!-- Label opcional solo si se pasa contenido por el slot -->
    <label v-if="$slots.default" class="font-black">
      <slot />
    </label>

    <select
      v-bind="$attrs"
      v-model="model"
      @change="emit('change', $event)"
      :class="
        clsx(
          'px-4 py-2 rounded-2xl w-full text-base font-bold border-2 border-slate-300  bg-gray-50 focus:outline-none  transition-colors',
          {
            ' text-blue-800! focus:border-blue-500!':
              props.variant === 'primary',
            'text-red-800 focus:border-red-500': props.variant === 'danger',
            'text-teal-600 focus:border-teal-600': props.variant === 'studio',
          },
          props.class,
        )
      "
    >
      <option value="" selected disabled hidden>Seleccionar Nivel</option>
      <option
        v-for="option in options"
        :value="option.value"
        :key="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
