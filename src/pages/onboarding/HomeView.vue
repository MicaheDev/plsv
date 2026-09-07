<template>
  <div class="w-full h-svh flex flex-col overflow-hidden">
    <div ref="scrollRef" @scroll="handleScroll"
      class="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none [&::-webkit-scrollbar]:hidden">
      <div v-for="slide in slides" :key="slide.id"
        class="w-screen h-full shrink-0 snap-center flex flex-col justify-center items-center gap-8 p-8 box-border">
        <div class="flex flex-col gap-2">
          <h1 class="text-left text-3xl font-black m-0">{{ slide.title }}</h1>
          <p class="text-fg-muted font-medium text-clip text-sm">Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
        </div>
        <img :class="['rounded-4xl h-full bg-[#EAEAEA]', slide.className]" :src="slide.imgSrc" alt="Ilustración de la lección" />
      </div>
    </div>

    <div class="w-full flex flex-col justify-center items-center gap-4 px-8 pb-8 pt-2 box-border">
      <div class="flex gap-2">
        <div v-for="(_, index) in slides" :key="index" :class="[
          'h-2 rounded-full transition-all duration-300 ease-in-out',
          slideActual === index ? 'w-8 bg-fg border-fg' : 'w-2 bg-stroke'
        ]" />
      </div>


      <Button class="w-full" type="button" variant="primary" @click="manejarSiguiente">
        {{ slideActual === slides.length - 1 ? "Empezar" : "Siguiente" }}
      </Button>
      <Button class="w-full justify-between" type="button" variant="secondary" @click="router.push('/login')">
        Ya tengo una cuenta
      </Button>
    </div>
  </div>
</template>

<script setup>
import Button from '@/components/Button.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Definición de las diapositivas con clases de Tailwind
const slides = [
  {
    id: "1",
    title: "¡Hola! Vamos a aprender señas juntos",
    imgSrc: "img/1.png",
    className: "w-full h-60 object-cover"
  },
  {
    id: "2",
    title: "Mira el video y repite el movimiento",
    imgSrc: "img/2.gif",
    className: "w-60 aspect-square object-cover"
  },
  {
    id: "3",
    title: "Usa tu cámara para que te ayudemos",
    imgSrc: "img/3.jpg",
    className: "w-full h-60 object-cover"
  }
]

// Estados reactivos
const slideActual = ref(0)
const scrollRef = ref(null)

// Enrutador de Vue Router
const router = useRouter()

// Detectar posición del scroll
const handleScroll = () => {
  if (scrollRef.value) {
    const index = Math.round(
      scrollRef.value.scrollLeft / window.innerWidth
    )
    slideActual.value = index
  }
}

// Lógica de navegación
const manejarSiguiente = () => {
  if (slideActual.value < slides.length - 1) {
    scrollRef.value?.scrollTo({
      left: window.innerWidth * (slideActual.value + 1)
    })
  } else {
    console.log("Redireccionando al área de aprendizaje...")
    router.push('/aprender')
  }
}
</script>