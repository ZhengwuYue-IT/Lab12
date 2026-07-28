<script setup>
import { ref } from 'vue'
import { ROLE_OPTIONS, getAuthErrorMessage, registerUser } from '../services/auth'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('Member')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Password and confirm password must match.'
    return
  }

  isSubmitting.value = true

  try {
    const user = await registerUser(email.value, password.value, role.value)
    successMessage.value = `${user.email} was registered successfully as ${user.role}. You can now sign in.`
    password.value = ''
    confirmPassword.value = ''
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error)
    console.error('[Firebase Auth] Registration failed:', error.code)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-shell surface-card" aria-labelledby="register-heading">
      <aside class="auth-aside register-aside">
        <span class="auth-icon" aria-hidden="true">+</span>
        <p class="eyebrow text-warning">Firebase Authentication</p>
        <h1 class="display-6 fw-bold">Create a library account</h1>
        <p>
          Register with email and password, then store a tutorial role in the Firebase user profile.
        </p>
        <ol class="auth-steps">
          <li>Choose Member or Librarian</li>
          <li>Create the Firebase account</li>
          <li>Sign in on the separate login page</li>
        </ol>
      </aside>

      <div class="auth-form-panel">
        <p class="eyebrow">eFolio Task 7.1</p>
        <h2 id="register-heading" class="h2 mb-2">Firebase registration</h2>
        <p class="text-secondary mb-4">All fields are required. Passwords need six characters.</p>

        <div v-if="successMessage" class="alert alert-success" role="status">
          <strong>Registration complete.</strong> {{ successMessage }}
          <router-link class="d-block mt-2 fw-semibold" :to="{ name: 'FireSignIn' }">
            Continue to Firebase sign in
          </router-link>
        </div>
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label for="register-email" class="form-label">Email address</label>
            <input
              id="register-email"
              v-model.trim="email"
              class="form-control form-control-lg"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              required
            />
          </div>

          <div class="mb-3">
            <label for="register-role" class="form-label">Library role</label>
            <select id="register-role" v-model="role" class="form-select form-select-lg" required>
              <option v-for="option in ROLE_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }} - {{ option.description }}
              </option>
            </select>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label for="register-password" class="form-label">Password</label>
              <input
                id="register-password"
                v-model="password"
                class="form-control form-control-lg"
                type="password"
                minlength="6"
                autocomplete="new-password"
                required
              />
            </div>
            <div class="col-md-6">
              <label for="register-confirm-password" class="form-label">Confirm password</label>
              <input
                id="register-confirm-password"
                v-model="confirmPassword"
                class="form-control form-control-lg"
                type="password"
                minlength="6"
                autocomplete="new-password"
                required
              />
            </div>
          </div>

          <button class="btn btn-primary btn-lg w-100 mt-4" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating Firebase account...' : 'Register with Firebase' }}
          </button>
        </form>

        <p class="auth-switch mb-0">
          Already registered?
          <router-link :to="{ name: 'FireSignIn' }">Open Firebase sign in</router-link>.
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
  grid-template-columns: minmax(300px, 0.85fr) minmax(420px, 1.15fr);
  width: min(1040px, 100%);
  overflow: hidden;
}

.auth-aside,
.auth-form-panel {
  padding: clamp(2rem, 5vw, 4rem);
}

.auth-aside {
  color: #eefbfc;
  background: linear-gradient(145deg, #102a43, #087f8c);
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
  font-size: 2rem;
  font-weight: 900;
}

.auth-steps {
  display: grid;
  gap: 0.9rem;
  margin: 2rem 0 0;
  padding-left: 1.25rem;
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
