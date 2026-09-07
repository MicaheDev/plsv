<script setup>
import clsx from 'clsx';

// Habilita el soporte nativo para v-model en Vue 3.4+
const model = defineModel({
  type: [String, Number],
  default: ''
});

const props = defineProps({
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: ''
  }
});

// Desactivamos la herencia automática para aplicar atributos directamente al <input>
defineOptions({
  inheritAttrs: false
});
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <!-- Label opcional solo si se pasa contenido por el slot -->
    <label v-if="$slots.default" class="font-black text-fg">
      <slot />
    </label>

    <input
      v-bind="$attrs"
      v-model="model"
      :type="props.type"
      :placeholder="props.placeholder"
      :class="clsx(
        'px-4 py-3 rounded-2xl w-full text-base font-bold border-2 border-stroke bg-bg-subtle text-fg placeholder:text-fg-muted focus:outline-none focus:border-stroke-strong transition-colors',
        props.class
      )"
    />
  </div>
</template>