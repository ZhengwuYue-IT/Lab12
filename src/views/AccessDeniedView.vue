<template>
  <div class="page-wrap denied-wrap">
    <section class="surface-card denied-card text-center">
      <span class="status-code">403</span>
      <p class="eyebrow">Access denied</p>
      <h1 class="page-title">This page is for authenticated members.</h1>
      <p class="page-lead mx-auto">
        The navigation guard prevented unauthorised access. Sign in with a registered Firebase
        account and the router will return you to the protected page.
      </p>
      <div class="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
        <router-link to="/" class="btn btn-outline-secondary px-4">Return home</router-link>
        <router-link
          :to="{ name: 'FireSignIn', query: { redirect: '/about', denied: '1' } }"
          class="btn btn-primary px-4"
        >
          Go to Firebase sign in
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.denied-wrap {
  display: grid;
  min-height: calc(100vh - 180px);
  place-items: center;
}

.denied-card {
  max-width: 780px;
  padding: clamp(2rem, 7vw, 5rem);
}

.status-code {
  display: inline-block;
  margin-bottom: 1rem;
  color: #d64545;
  font-size: clamp(3.2rem, 9vw, 6rem);
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1;
}
</style>
