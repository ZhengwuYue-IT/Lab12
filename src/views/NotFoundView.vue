<template>
  <div class="page-wrap not-found-wrap">
    <section class="surface-card text-center p-5">
      <p class="eyebrow">404 - Route not found</p>
      <h1 class="page-title">The requested shelf does not exist.</h1>
      <p class="page-lead mx-auto">Use the navigation menu or return to the registration page.</p>
      <router-link to="/" class="btn btn-primary px-4 mt-3">Return home</router-link>
    </section>
  </div>
</template>

<style scoped>
.not-found-wrap {
  display: grid;
  min-height: calc(100vh - 180px);
  place-items: center;
}
</style>
