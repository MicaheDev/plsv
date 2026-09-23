<script setup>
import LinkButton from '@/components/LinkButton.vue';
</script>

<template>
  <div
    class="w-full h-full max-w-2xl mx-auto flex flex-col justify-center max-lg:justify-between gap-4 items-center p-4">

    <!-- Sección principal: Texto e imágenes -->
    <div class="flex items-center max-lg:flex-col max-lg:justify-between gap-8 max-lg:gap-2">
      <div class="w-full flex flex-col gap-2">
        <h2 class="text-3xl text-center font-black">Bienvenidos a LinguSeñas</h2>
        <p class="text-gray-700 max-lg:hidden text-justify">
          LinguSeñas es un proyecto socio-tecnológico contextualizado en la U.E. Bartolomé Salom en Puerto Cabello,
          concebido para reducir las barreras de comunicación entre la comunidad sorda y los oyentes mediante
          herramientas digitales interactivas.
          Su propósito principal es facilitar el aprendizaje, práctica y difusión de la Lengua de Señas Venezolana (LSV)
          en el entorno escolar, integrando a estudiantes, docentes y representantes en un espacio inclusivo.
        </p>
      </div>

      <!-- Grid de imágenes / Collage -->
      <div class="w-full grid grid-cols-2 gap-2 p-2 max-w-xl mx-auto">
        <!-- Primera imagen: ocupa las 2 columnas -->
        <img src="/img/1.png" alt="LinguSeñas 1"
          class="col-span-2 aspect-square max-lg:aspect-video object-cover object-top w-full rounded-lg" />

        <!-- Segunda imagen: columna 1 -->
        <img src="/img/2.png" alt="LinguSeñas 2" class="aspect-square object-cover w-full rounded-lg" />

        <!-- Tercera imagen: columna 2 -->
        <img src="/img/3.png" alt="LinguSeñas 3" class="aspect-square object-cover w-full rounded-lg" />
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="w-full flex flex-row gap-3 max-lg:flex-col justify-center">
      <LinkButton class="w-full" to="/welcome" variant="primary">
        Empezar
      </LinkButton>

      <LinkButton class="w-full" to="/login" variant="secondary">
        Ya tengo una cuenta
      </LinkButton>


    </div>

  </div>
</template>

