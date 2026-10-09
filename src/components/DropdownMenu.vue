<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";


const isOpen = defineModel({ type: Boolean, default: false });

const props = defineProps({
  position: {
    type: String,
    default: 'bottom-right', 
  },
});

const dropdownRef = ref(null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeMenu();
  }
};

// Cerrar con la tecla Escape
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block text-left">
    <button
      type="button"
      @click="toggleMenu"
      class="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
      aria-label="Opciones"
      :aria-expanded="isOpen"
    >
      <slot name="trigger">
        <FontAwesomeIcon :icon="faEllipsisVertical" class="text-lg" />
      </slot>
    </button>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        
        :class="[
          'absolute z-50 min-w-48 rounded-xl border border-slate-300 bg-white p-1 shadow-md focus:outline-none',
          {
            'right-0 top-full mt-2': position === 'bottom-right',
            'left-0 top-full mt-2': position === 'bottom-left',
            'right-0 bottom-full mb-2': position === 'top-right',
            'left-0 bottom-full mb-2': position === 'top-left',
          }
        ]"
      >
        <slot :close="closeMenu"></slot>
      </div>
    </Transition>
  </div>
</template>