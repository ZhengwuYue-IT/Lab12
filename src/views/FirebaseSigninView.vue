<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROLE_OPTIONS, getAuthErrorMessage, signInUser } from '../services/auth'

const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const role = ref('Member')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSignIn = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const user = await signInUser(email.value, password.value, role.value)
    console.info(
      '[Lab 7 evidence] Current user:',
      `${user.email} | role: ${user.displayName || role.value}`
    )

    const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/about'
    await router.push(redirectPath)
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error)
    console.error('[Firebase Auth] Sign in failed:', error.code)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-shell surface-card" aria-labelledby="signin-heading">
      <aside class="auth-aside">
        <span class="auth-icon" aria-hidden="true">ID</span>
        <p class="eyebrow text-warning">Firebase Authentication</p>
        <h1 class="display-6 fw-bold">Role-aware sign in</h1>
        <p>
          Firebase verifies the email and password. NoMash Library then confirms that the selected
          tutorial role matches the registered profile.
        </p>
        <div class="role-preview">
          <span>Member</span>
          <span>Librarian</span>
        </div>
      </aside>

      <div class="auth-form-panel">
        <p class="eyebrow">eFolio Tasks 7.1 and 7.2</p>
        <h2 id="signin-heading" class="h2 mb-2">Firebase sign in</h2>
        <p class="text-secondary mb-4">
          Open the browser console after sign in to inspect the current Firebase user.
        </p>

        <div v-if="route.query.denied === '1'" class="alert alert-warning" role="alert">
          <strong>Protected route.</strong> Sign in before opening the role workspace.
          <router-link class="d-block mt-1" :to="{ name: 'AccessDenied' }">
            Why was access denied?
          </router-link>
        </div>
        <div v-if="route.query.registered === '1'" class="alert alert-success" role="status">
          Registration succeeded. Sign in with the new Firebase account.
        </div>
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSignIn">
          <div class="mb-3">
            <label for="signin-email" class="form-label">Email address</label>
            <input
              id="signin-email"
              v-model.trim="email"
              class="form-control form-control-lg"
              type="email"
              autocomplete="email"
              required
            />
          </div>

          <div class="mb-3">
            <label for="signin-password" class="form-label">Password</label>
            <input
              id="signin-password"
              v-model="password"
              class="form-control form-control-lg"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>

          <div class="mb-4">
            <label for="signin-role" class="form-label">Sign in as</label>
            <select id="signin-role" v-model="role" class="form-select form-select-lg" required>
              <option v-for="option in ROLE_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <button class="btn btn-primary btn-lg w-100" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Checking Firebase account...' : `Sign in as ${role}` }}
          </button>
        </form>

        <p class="auth-switch mb-0">
          Need an account?
          <router-link :to="{ name: 'FireRegister' }">Register with Firebase</router-link>.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  min-height: calc(100vh - 150px);
  padding: 3rem 1rem 0;
  place-items: center;
}

.auth-shell {
  display: grid;
  grid-template-columns: minmax(300px, 0.85fr) minmax(400px, 1.15fr);
  width: min(1000px, 100%);
  overflow: hidden;
}

.auth-aside,
.auth-form-panel {
  padding: clamp(2rem, 5vw, 4rem);
}

.auth-aside {
  color: #eefbfc;
  background: linear-gradient(145deg, #102a43, #6b3f78);
}

.auth-icon {
  display: grid;
  width: 64px;
  height: 64px;
  margin-bottom: 2rem;
  place-items: center;
  border-radius: 20px;
  color: #102a43;
  background: #ffca58;
  font-weight: 900;
}

.role-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 2rem;
}

.role-preview span {
  padding: 0.5rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 700;
}

.auth-form-panel {
  background: white;
}

.form-label {
  font-weight: 700;
}

.auth-switch {
  margin-top: 1.5rem;
  color: #526d82;
  text-align: center;
}

@media (max-width: 767.98px) {
  .auth-page {
    padding: 1.5rem 0.65rem 0;
  }

  .auth-shell {
    grid-template-columns: 1fr;
  }
}
</style>
