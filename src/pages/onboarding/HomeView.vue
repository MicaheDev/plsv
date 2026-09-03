<template>
  <div class="c-container">
    <h1>LSV</h1>
    <br>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, blanditiis?|</p>
    <br>
    <RouterLink to="/welcome">Empezar ahora</RouterLink>
    <br>
    <RouterLink to="/login">Ya tengo una cuenta</RouterLink>
  </div>
</template>

<style scoped>
.c-container {
  width: 100%;
  height: 100svh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 20px;

  text-align: center;
}

p {
  max-width: 80%;
  text-align: center;
}
</style>
<!--
<template>
  <div class="carousel-container">
    <div ref="scrollRef" @scroll="handleScroll" class="carousel-track" style="scrollbar-width: none;">
      <div v-for="slide in slides" :key="slide.id" class="carousel-slide">
        <div>
          <h1 class="slide-title">{{ slide.title }}</h1>
          <p class="slide-desc">Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
        </div>
        <img :class="['slide-media', slide.className]" :src="slide.imgSrc" alt="Ilustración de la lección" />
      </div>
    </div>

    <div class="carousel-controls">
      <div class="pagination-dots">
        <div v-for="(_, index) in slides" :key="index" :class="[
          'dot',
          slideActual === index ? 'dot--active' : 'dot--inactive'
        ]" />
      </div>

      <button @click="manejarSiguiente" class="btn-primary">
        {{ slideActual === slides.length - 1 ? "Empezar" : "Siguiente" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Definición de las diapositivas (Slides)
// Nota: Dejamos los tamaños específicos en className para respetar tu lógica dinámica
const slides = [
  {
    id: "1",
    title: "¡Hola! Vamos a aprender señas juntos",
    imgSrc: "img/1.png",
    className: "media-full"
  },
  {
    id: "2",
    title: "Mira el video y repite el movimiento",
    imgSrc: "img/2.gif",
    className: "media-compact"
  },
  {
    id: "3",
    title: "Usa tu cámara para que te ayudemos",
    imgSrc: "img/3.jpg",
    className: "media-full"
  }
]

// Estados reactivos
const slideActual = ref(0)
const scrollRef = ref(null)

// Enrutador de Vue Router
const router = useRouter()

// Detectar en qué diapositiva estamos al hacer scroll horizontal
const handleScroll = () => {
  if (scrollRef.value) {
    const index = Math.round(
      scrollRef.value.scrollLeft / window.innerWidth
    )
    slideActual.value = index
  }
}

// Lógica del botón "Siguiente" o "Empezar"
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

<style scoped>
/* Contenedor Principal (w-full h-svh flex flex-col...) */
.carousel-container {
  width: 100%;
  height: 100svh;
  /* Small Viewport Height para móviles */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-x: auto;
  font-family: 'Montserrat', sans-serif;
  color: #311700;
  background-color: #f6f87a;
}

/* Track de Scroll (w-full h-full flex overflow-x-auto snap-x...) */
.carousel-track {
  width: 100%;
  height: 100%;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

/* Cada Diapositiva (w-screen snap-center gap-8...) */
.carousel-slide {
  width: 100vw;
  scroll-snap-align: center;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  /* gap-8 = 32px */
  padding: 2rem;
  /* p-8 = 32px */
  box-sizing: border-box;
}

/* Título (text-center text-4xl font-black) */
.slide-title {
  text-align: left;
  font-size: 2.25rem;
  /* text-4xl */
  font-weight: 900;
  /* font-black */
  margin: 0;
}

.slide-desc {
  opacity: 0.8;
  font-weight: 500;
}

/* Imagen base (rounded-4xl) */
.slide-media {
  border-radius: 2rem;
  /* rounded-4xl = 32px */
}

/* Clases dinámicas de las imágenes (reemplazo de Tailwind) */
.media-full {
  width: 100%;
  height: 15rem;
  /* h-60 = 240px */
  object-fit: cover;
}

.media-compact {
  width: 10rem;
  /* w-40 = 160px */
  height: min-content;
  /* h-min */
  object-fit: cover;
}

/* Controles Inferiores (w-full flex flex-col gap-4...) */
.carousel-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  /* gap-4 = 16px */
  padding: 2rem;
  /* p-8 = 32px */
  box-sizing: border-box;
}

/* Contenedor de puntitos (flex gap-2) */
.pagination-dots {
  display: flex;
  gap: 0.5rem;
  /* gap-2 = 8px */
}

/* Estilo base de los puntos (h-2 border transition-all duration-300...) */
.dot {
  height: 0.5rem;
  /* h-2 = 8px */
  border-radius: 9999px;
  /* rounded-full */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* duration-300 */
}

/* Estado Activo (w-8 bg-amber-300) */
.dot--active {
  width: 2rem;
  /* w-8 = 32px */
  background-color: #311700;
  /* bg-amber-300 */
  border-color: #311700;
}

/* Estado Inactivo (w-2 bg-gray-300) */
.dot--inactive {
  width: 0.5rem;
  /* w-2 = 8px */
  background-color: #311700;
  /* bg-gray-300 */
}

/* Botón Principal (w-full h-15 border font-black text-xl...) */
.btn-primary {
  width: 100%;
  height: 3.75rem;
  /* h-15 = 60px */
  font-weight: 900;
  /* font-black */
  font-size: 1.25rem;
  /* text-xl */
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background-color: #311700;
  /* bg-amber-300 */
  border-radius: 50px;
  /* rounded-2xl = 16px */
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #f9f2e0;
  font-family: 'Montserrat', sans-serif;

}

.btn-primary:active {
  background-color: #311700;
  /* Efecto de click simulando amber-400 */
}
</style>
-->
