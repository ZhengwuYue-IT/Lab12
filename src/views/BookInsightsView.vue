<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { collection, getDocs } from 'firebase/firestore'
import { cloudFunctionUrls } from '../config/cloudFunctions'
import { db } from '../Firebase/init'

const insights = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)

const formattedGeneratedAt = computed(() => {
  if (!insights.value?.generatedAt) return ''
  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(new Date(insights.value.generatedAt))
})

const loadInsights = async () => {
  errorMessage.value = ''

  if (!cloudFunctionUrls.bookInsights) {
    errorMessage.value = 'The deployed bookInsights URL has not been configured yet.'
    return
  }

  isLoading.value = true

  try {
    const firestoreSnapshot = await getDocs(collection(db, 'books'))
    const firestoreBooks = firestoreSnapshot.docs.map((bookDocument) => {
      const bookData = bookDocument.data()

      return {
        isbn: bookData.isbn,
        name: bookData.name
      }
    })

    const response = await axios.post(
      cloudFunctionUrls.bookInsights,
      JSON.stringify({ books: firestoreBooks }),
      {
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        timeout: 15000
      }
    )
    const payload = response.data

    if (!payload?.ok || !Number.isInteger(payload.total) || !Array.isArray(payload.books)) {
      throw new Error('The cloud function returned an invalid insights payload.')
    }

    insights.value = payload
  } catch (error) {
    console.error('[Cloud Functions] bookInsights request failed:', error)
    errorMessage.value = 'Unable to load the cloud book insights. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadInsights)
</script>

<template>
  <section class="page-wrap insights-page" aria-labelledby="insights-heading">
    <header class="insights-header">
      <div>
        <p class="eyebrow">Firestore → Vue → Alibaba Cloud</p>
        <h1 id="insights-heading" class="page-title text-start">Book Insights</h1>
        <p class="page-lead">
          A live catalogue built from Firestore data by an Alibaba Cloud Function Compute function
          running in Hangzhou.
        </p>
      </div>
      <button class="btn btn-outline-primary px-4" type="button" :disabled="isLoading" @click="loadInsights">
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        {{ isLoading ? 'Refreshing...' : 'Refresh insights' }}
      </button>
    </header>

    <div v-if="errorMessage" class="alert alert-danger surface-card" role="alert">
      <strong>Cloud request failed.</strong> {{ errorMessage }}
    </div>

    <div v-else-if="isLoading && !insights" class="loading-panel surface-card" role="status">
      <span class="spinner-border text-primary" aria-hidden="true"></span>
      <span>Reading Firestore, then sending its JSON data to Alibaba Cloud...</span>
    </div>

    <template v-else-if="insights">
      <div class="metric-grid" aria-label="Book collection summary">
        <article class="metric-card total">
          <span>Books available</span>
          <strong>{{ insights.total }}</strong>
          <small>Firestore records processed in Hangzhou</small>
        </article>
        <article class="metric-card">
          <span>Lowest ISBN</span>
          <strong>{{ insights.summary.minIsbn ?? 'N/A' }}</strong>
          <small>Beginning of the catalogue range</small>
        </article>
        <article class="metric-card">
          <span>Highest ISBN</span>
          <strong>{{ insights.summary.maxIsbn ?? 'N/A' }}</strong>
          <small>End of the catalogue range</small>
        </article>
      </div>

      <section class="catalogue surface-card" aria-labelledby="catalogue-heading">
        <div class="catalogue-heading">
          <div>
            <p class="eyebrow mb-1">Cloud catalogue</p>
            <h2 id="catalogue-heading" class="h3 mb-1">Firestore bookshelf</h2>
          </div>
          <span class="generated-at">Generated {{ formattedGeneratedAt }}</span>
        </div>

        <div v-if="insights.books.length" class="book-grid">
          <article v-for="(book, index) in insights.books" :key="`${book.isbn}-${index}`" class="book-card">
            <span class="book-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="book-spine" aria-hidden="true"></div>
            <div>
              <p class="isbn-label">ISBN {{ book.isbn ?? 'Not supplied' }}</p>
              <h3>{{ book.name }}</h3>
            </div>
          </article>
        </div>
        <div v-else class="empty-catalogue">No books are currently stored in Firestore.</div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.insights-page {
  padding-top: 2.75rem;
}

.insights-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.6rem;
}

.insights-header code {
  color: #086f77;
  font-weight: 700;
}

.loading-panel {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  padding: 2rem;
  color: #526d82;
  font-weight: 700;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.metric-card {
  position: relative;
  overflow: hidden;
  min-height: 165px;
  padding: 1.35rem;
  border: 1px solid #d9e2ec;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 28px rgba(16, 42, 67, 0.08);
}

.metric-card::after {
  position: absolute;
  right: -2rem;
  bottom: -3rem;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: rgba(8, 127, 140, 0.08);
  content: '';
}

.metric-card.total {
  color: white;
  border-color: #174f63;
  background: linear-gradient(145deg, #102a43, #174f63);
}

.metric-card span,
.metric-card small {
  display: block;
}

.metric-card span {
  color: #526d82;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-card.total span,
.metric-card.total small {
  color: #b8d8e7;
}

.metric-card strong {
  display: block;
  margin: 0.25rem 0;
  color: #102a43;
  font-size: clamp(2rem, 4vw, 3.3rem);
  line-height: 1.1;
}

.metric-card.total strong {
  color: #ffca58;
}

.metric-card small {
  color: #6b8192;
}

.catalogue {
  padding: clamp(1.25rem, 3vw, 2rem);
}

.catalogue-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.1rem;
  border-bottom: 1px solid #e6edf2;
}

.generated-at {
  color: #6b8192;
  font-size: 0.78rem;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding-top: 1.25rem;
}

.book-card {
  position: relative;
  display: grid;
  min-height: 145px;
  grid-template-columns: 8px 1fr;
  align-content: end;
  gap: 1rem;
  overflow: hidden;
  padding: 1.2rem;
  border: 1px solid #d9e2ec;
  border-radius: 0.85rem;
  background: linear-gradient(160deg, #fff, #f5fafc);
}

.book-spine {
  position: absolute;
  inset: 0 auto 0 0;
  width: 8px;
  background: linear-gradient(180deg, #0d8b92, #ffca58);
}

.book-number {
  position: absolute;
  top: 0.85rem;
  right: 0.95rem;
  color: #c5d2dc;
  font-size: 1.3rem;
  font-weight: 800;
}

.isbn-label {
  margin-bottom: 0.35rem;
  color: #087f8c;
  font-size: 0.73rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.book-card h3 {
  margin: 0;
  color: #102a43;
  font-size: 1.03rem;
  line-height: 1.35;
}

.empty-catalogue {
  padding: 3rem 1rem;
  color: #6b8192;
  text-align: center;
}

@media (max-width: 899.98px) {
  .metric-grid,
  .book-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 575.98px) {
  .insights-header,
  .catalogue-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .metric-grid,
  .book-grid {
    grid-template-columns: 1fr;
  }
}
</style>
