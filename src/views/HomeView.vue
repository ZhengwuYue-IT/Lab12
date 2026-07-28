<script setup>
import { computed, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const createInitialForm = () => ({
  username: '',
  password: '',
  confirmPassword: '',
  isAustralian: false,
  reason: '',
  gender: '',
  suburb: 'Clayton'
})

const formData = ref(createInitialForm())
const submittedCards = ref([])
const successMessage = ref('')
const errors = ref({
  username: null,
  password: null,
  confirmPassword: null,
  gender: null,
  reason: null
})

const friendMessage = computed(() =>
  /\bfriend\b/i.test(formData.value.reason) ? 'Great to have a friend' : ''
)

const validateName = (blur) => {
  const isInvalid = formData.value.username.trim().length < 3
  if (isInvalid && blur) errors.value.username = 'Name must be at least 3 characters.'
  if (!isInvalid) errors.value.username = null
}

const validatePassword = (blur) => {
  const password = formData.value.password
  const rules = [
    [password.length >= 8, 'Password must be at least 8 characters long.'],
    [/[A-Z]/.test(password), 'Password must contain an uppercase letter.'],
    [/[a-z]/.test(password), 'Password must contain a lowercase letter.'],
    [/\d/.test(password), 'Password must contain a number.'],
    [/[^A-Za-z0-9]/.test(password), 'Password must contain a special character.']
  ]
  const failedRule = rules.find(([passed]) => !passed)

  if (failedRule && blur) errors.value.password = failedRule[1]
  if (!failedRule) errors.value.password = null
}

const validateConfirmPassword = (blur) => {
  const isInvalid = formData.value.password !== formData.value.confirmPassword
  if (isInvalid && blur) errors.value.confirmPassword = 'Passwords do not match.'
  if (!isInvalid) errors.value.confirmPassword = null
}

const validateGender = () => {
  errors.value.gender = formData.value.gender ? null : 'Please select a gender option.'
}

const validateReason = (blur) => {
  const length = formData.value.reason.trim().length
  const isInvalid = length < 10
  if (isInvalid && (blur || length > 0))
    errors.value.reason = 'Reason must be at least 10 characters.'
  if (!isInvalid) errors.value.reason = null
}

const resetForm = () => {
  formData.value = createInitialForm()
  errors.value = {
    username: null,
    password: null,
    confirmPassword: null,
    gender: null,
    reason: null
  }
}

const clearForm = () => {
  successMessage.value = ''
  resetForm()
}

const submitForm = () => {
  validateName(true)
  validatePassword(true)
  validateConfirmPassword(true)
  validateGender()
  validateReason(true)

  if (Object.values(errors.value).some(Boolean)) {
    successMessage.value = ''
    return
  }

  submittedCards.value.push({
    username: formData.value.username.trim(),
    password: '********',
    isAustralian: formData.value.isAustralian,
    gender: formData.value.gender,
    reason: formData.value.reason.trim()
  })
  successMessage.value = `Registration preview created for ${formData.value.username.trim()}.`
  resetForm()
}
</script>

<template>
  <div class="page-wrap">
    <section class="hero-grid align-items-center">
      <div>
        <p class="eyebrow">Week 5 - Events and data binding</p>
        <h1 class="page-title">Library Registration Form</h1>
        <p class="page-lead mb-0">
          A responsive Vue form demonstrating event handling, two-way data binding and accessible
          validation feedback.
        </p>
      </div>
      <div class="concept-badge" aria-label="Concepts demonstrated">
        <span>v-model</span>
        <span>@blur</span>
        <span>@input</span>
      </div>
    </section>

    <section class="surface-card form-card mt-4" aria-labelledby="registration-heading">
      <div class="form-card-header">
        <div>
          <p class="section-kicker">Member registration</p>
          <h2 id="registration-heading" class="h4 mb-1">Create your library profile</h2>
          <p class="text-secondary mb-0">Fields are validated using Vue event handlers.</p>
        </div>
        <span class="step-chip">Activity 5.3</span>
      </div>

      <form class="p-4" novalidate @submit.prevent="submitForm">
        <div v-if="successMessage" class="alert alert-success" role="status">
          {{ successMessage }}
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="formData.username"
              class="form-control"
              :class="{ 'is-invalid': errors.username }"
              type="text"
              autocomplete="username"
              :aria-invalid="Boolean(errors.username)"
              aria-describedby="username-error"
              @blur="validateName(true)"
              @input="validateName(false)"
            />
            <div id="username-error" class="invalid-feedback">{{ errors.username }}</div>
          </div>

          <div class="col-md-6">
            <label for="gender" class="form-label">Gender</label>
            <select
              id="gender"
              v-model="formData.gender"
              class="form-select"
              :class="{ 'is-invalid': errors.gender }"
              :aria-invalid="Boolean(errors.gender)"
              aria-describedby="gender-error"
              @change="validateGender"
            >
              <option disabled value="">Select an option</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            <div id="gender-error" class="invalid-feedback">{{ errors.gender }}</div>
          </div>

          <div class="col-md-6">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="formData.password"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              type="password"
              autocomplete="new-password"
              :aria-invalid="Boolean(errors.password)"
              aria-describedby="password-help password-error"
              @blur="validatePassword(true)"
              @input="validatePassword(false)"
            />
            <div id="password-help" class="form-text">
              Use 8+ characters with mixed character types.
            </div>
            <div id="password-error" class="invalid-feedback">{{ errors.password }}</div>
          </div>

          <div class="col-md-6">
            <label for="confirm-password" class="form-label">Confirm password</label>
            <input
              id="confirm-password"
              v-model="formData.confirmPassword"
              class="form-control"
              :class="{ 'is-invalid': errors.confirmPassword }"
              type="password"
              autocomplete="new-password"
              :aria-invalid="Boolean(errors.confirmPassword)"
              aria-describedby="confirm-password-error"
              @blur="validateConfirmPassword(true)"
            />
            <div id="confirm-password-error" class="invalid-feedback">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <div class="col-12">
            <div class="form-check">
              <input
                id="isAustralian"
                v-model="formData.isAustralian"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="isAustralian">Australian Resident?</label>
            </div>
          </div>

          <div class="col-12">
            <label for="reason" class="form-label">Reason for joining</label>
            <textarea
              id="reason"
              v-model="formData.reason"
              class="form-control"
              :class="{ 'is-invalid': errors.reason }"
              rows="3"
              :aria-invalid="Boolean(errors.reason)"
              aria-describedby="reason-feedback"
              @blur="validateReason(true)"
              @input="validateReason(false)"
            ></textarea>
            <div id="reason-feedback">
              <div v-if="errors.reason" class="text-danger feedback-text" role="alert">
                {{ errors.reason }}
              </div>
              <div v-if="friendMessage" class="text-success feedback-text" role="status">
                {{ friendMessage }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <label for="suburb" class="form-label">Suburb</label>
            <input id="suburb" :value="formData.suburb" class="form-control" type="text" />
            <div class="form-text">
              One-way binding demo: the field displays the source value through
              <code>v-bind</code>.
            </div>
          </div>
        </div>

        <div class="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
          <button class="btn btn-outline-secondary px-4" type="button" @click="clearForm">
            Clear
          </button>
          <button class="btn btn-primary px-4" type="submit">Submit registration</button>
        </div>
      </form>
    </section>

    <section class="surface-card mt-4 overflow-hidden" aria-labelledby="preview-heading">
      <div class="preview-header">
        <div>
          <p class="section-kicker">PrimeVue component</p>
          <h2 id="preview-heading" class="h5 mb-0">Registration preview</h2>
        </div>
        <span class="record-count">{{ submittedCards.length }} record(s)</span>
      </div>
      <DataTable :value="submittedCards" responsive-layout="scroll" striped-rows>
        <template #empty>
          <div class="empty-state">Submit a valid form to preview a registration record.</div>
        </template>
        <Column field="username" header="Username"></Column>
        <Column field="password" header="Password"></Column>
        <Column field="isAustralian" header="Australian Resident">
          <template #body="slotProps">{{ slotProps.data.isAustralian ? 'Yes' : 'No' }}</template>
        </Column>
        <Column field="gender" header="Gender"></Column>
        <Column field="reason" header="Reason"></Column>
      </DataTable>
    </section>
  </div>
</template>

<style scoped>
.hero-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
}

.concept-badge {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 0.45rem;
}

.concept-badge span,
.step-chip,
.record-count {
  border: 1px solid #b9dce0;
  border-radius: 999px;
  color: #075d63;
  background: #e9f7f7;
  font-size: 0.76rem;
  font-weight: 700;
}

.concept-badge span {
  padding: 0.55rem 0.75rem;
}

.form-card {
  overflow: hidden;
}

.form-card-header,
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #d9e2ec;
  background: linear-gradient(100deg, #f7fbfc, #eff8f8);
}

.section-kicker {
  margin: 0 0 0.25rem;
  color: #087f8c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.step-chip,
.record-count {
  padding: 0.35rem 0.7rem;
  white-space: nowrap;
}

.form-label {
  color: #243b53;
  font-weight: 700;
}

.feedback-text {
  margin-top: 0.35rem;
  font-size: 0.875rem;
}

.empty-state {
  padding: 1rem;
  color: #627d98;
  text-align: center;
}

code {
  color: #7a306c;
}

@media (max-width: 767.98px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .concept-badge {
    justify-content: start;
  }
}
</style>
