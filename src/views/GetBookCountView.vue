<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { cloudFunctionUrls } from '../config/cloudFunctions'

const count = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)

const getBookCount = async () => {
  count.value = null
  errorMessage.value = ''

  if (!cloudFunctionUrls.countBooks) {
    errorMessage.value = 'The deployed countBooks URL has not been configured yet.'
    return
  }

  isLoading.value = true

  try {
    const response = await axios.get(cloudFunctionUrls.countBooks, { timeout: 15000 })
    const returnedCount = response.data?.count

    if (!Number.isInteger(returnedCount) || returnedCount < 0) {
      throw new Error('The cloud function returned an invalid count.')
    }

    count.value = returnedCount
  } catch (error) {
    console.error('[Cloud Functions] countBooks request failed:', error)
    errorMessage.value = 'Unable to retrieve the book count. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="page-wrap counter-page" aria-labelledby="book-counter-heading">
    <div class="counter-hero surface-card">
      <div class="counter-copy">
        <p class="eyebrow">Lab 9 - Alibaba Cloud</p>
        <h1 id="book-counter-heading" class="page-title text-start">Book Counter</h1>
        <p class="page-lead">
          Request a live count from an Alibaba Cloud Function Compute HTTP function. The function
          counts the books in its deployed <code>books.json</code> data file.
        </p>

        <div class="data-flow" aria-label="Data flow">
          <span>Vue + Axios</span>
          <strong aria-hidden="true">→</strong>
          <span>Alibaba Function Compute</span>
          <strong aria-hidden="true">→</strong>
          <span>books.json</span>
        </div>

        <button
          class="btn btn-primary btn-lg px-4"
          type="button"
          :disabled="isLoading"
          @click="getBookCount"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          {{ isLoading ? 'Counting books...' : 'Get Book Count' }}
        </button>
      </div>

      <aside class="count-panel" aria-live="polite">
        <p class="result-label">Live cloud function result</p>
        <template v-if="count !== null">
          <strong class="count-number">{{ count }}</strong>
          <p class="result-message">Total number of books: {{ count }}</p>
          <span class="status-chip success">Alibaba cloud function completed</span>
        </template>
        <template v-else-if="errorMessage">
          <strong class="count-number error-mark">!</strong>
          <p class="result-message text-danger">{{ errorMessage }}</p>
          <span class="status-chip error">Request error</span>
        </template>
        <template v-else>
          <strong class="count-number muted">--</strong>
          <p class="result-message">Select the button to request the current total.</p>
          <span class="status-chip">Ready</span>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.counter-page {
  padding-top: 3.25rem;
}

.counter-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 2rem;
  overflow: hidden;
  padding: clamp(1.5rem, 4vw, 3.2rem);
  background:
    radial-gradient(circle at 90% 10%, rgba(255, 202, 88, 0.22), transparent 20rem),
    rgba(255, 255, 255, 0.98);
}

.counter-copy {
  align-self: center;
}

.counter-copy code {
  color: #086f77;
  font-weight: 700;
}

.data-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin: 1.5rem 0 1.75rem;
}

.data-flow span {
  padding: 0.48rem 0.75rem;
  border: 1px solid #b8d8e7;
  border-radius: 999px;
  color: #174f63;
  background: #f2fbfc;
  font-size: 0.86rem;
  font-weight: 700;
}

.data-flow strong {
  color: #6b8192;
}

.count-panel {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 1px solid rgba(184, 216, 231, 0.85);
  border-radius: 1.25rem;
  text-align: center;
  background: linear-gradient(160deg, #102a43, #174f63);
  color: white;
  box-shadow: 0 18px 30px rgba(16, 42, 67, 0.18);
}

.result-label {
  margin-bottom: 0.35rem;
  color: #b8d8e7;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.count-number {
  font-size: clamp(4rem, 9vw, 6.75rem);
  line-height: 1;
}

.count-number.muted {
  color: #829ab1;
}

.error-mark {
  color: #ffca58;
}

.result-message {
  margin: 0.7rem 0 1rem;
  font-size: 1.05rem;
  font-weight: 700;
}

.status-chip {
  padding: 0.32rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  color: #dbe7f3;
  font-size: 0.75rem;
}

.status-chip.success {
  color: #d9f99d;
}

.status-chip.error {
  color: #ffd7d7;
}

@media (max-width: 767.98px) {
  .counter-page {
    padding-top: 1.5rem;
  }

  .counter-hero {
    grid-template-columns: 1fr;
  }
}
</style>
