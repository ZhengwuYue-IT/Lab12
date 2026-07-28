<script setup>
import { ref } from 'vue'
import { currentRole, currentUser, getAuthErrorMessage, signOutUser } from '../services/auth'

const previousEmail = ref(currentUser.value?.email ?? '')
const previousRole = ref(currentRole.value)
const isSignedOut = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSignOut = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await signOutUser()
    isSignedOut.value = true
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error)
    console.error('[Firebase Auth] Sign out failed:', error.code)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page-wrap signout-wrap">
    <section class="surface-card signout-card text-center" aria-labelledby="signout-heading">
      <span class="signout-icon" aria-hidden="true">OUT</span>
      <p class="eyebrow">eFolio Task 7.2</p>
      <h1 id="signout-heading" class="page-title">
        {{ isSignedOut ? 'Firebase session ended' : 'Log out of NoMash Library' }}
      </h1>

      <template v-if="!isSignedOut">
        <p class="page-lead mx-auto">
          Current user: <strong>{{ previousEmail }}</strong>
          <span class="role-pill">{{ previousRole }}</span>
        </p>
        <p class="text-secondary">
          Keep the developer console open. It will show the current user before logout and
          <code>null</code> after Firebase clears the session.
        </p>
        <button
          class="btn btn-danger btn-lg px-5 mt-3"
          type="button"
          :disabled="isSubmitting"
          @click="handleSignOut"
        >
          {{ isSubmitting ? 'Signing out...' : 'Confirm Firebase logout' }}
        </button>
      </template>

      <template v-else>
        <div class="alert alert-success mt-4" role="status">
          <strong>Logout complete.</strong> Firebase current user is now null.
        </div>
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
          <router-link to="/" class="btn btn-outline-secondary px-4">Return home</router-link>
          <router-link :to="{ name: 'FireSignIn' }" class="btn btn-primary px-4">
            Sign in again
          </router-link>
        </div>
      </template>

      <div v-if="errorMessage" class="alert alert-danger mt-4" role="alert">
        {{ errorMessage }}
      </div>
    </section>
  </div>
</template>

<style scoped>
.signout-wrap {
  display: grid;
  min-height: calc(100vh - 180px);
  place-items: center;
}

.signout-card {
  width: min(760px, 100%);
  padding: clamp(2rem, 7vw, 5rem);
}

.signout-icon {
  display: grid;
  width: 92px;
  height: 92px;
  margin: 0 auto 1.5rem;
  place-items: center;
  border-radius: 28px;
  color: #a61b1b;
  background: #ffe3e3;
  font-size: 1.15rem;
  font-weight: 900;
}

.role-pill {
  display: inline-flex;
  margin-left: 0.45rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  color: #22543d;
  background: #d9f7e9;
  font-size: 0.82rem;
  font-weight: 800;
}
</style>
