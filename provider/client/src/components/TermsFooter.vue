<template>
  <div class="my-3 text-center text-md-end">
    <router-link to="Privacy" v-slot="{ href }">
      <a :href="href" class="d-inline-block link-dark me-3"><small>Privacidade</small></a>
    </router-link>
    <router-link to="Tos" v-slot="{ href }">
      <a :href="href" class="d-inline-block link-dark"><small>Termos de serviço</small></a>
    </router-link>
  </div>
</template>
