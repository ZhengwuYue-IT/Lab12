<script setup>
import { onMounted, ref } from 'vue'
import { buildCountBookResponse } from '../services/catalogApi'

const apiResponse = ref(null)
const errorMessage = ref('')

const getApiData = () => {
  try {
    apiResponse.value = buildCountBookResponse()
    errorMessage.value = ''
  } catch (error) {
    console.error('[CountBookAPI] Unable to build the response:', error)
    errorMessage.value = 'Unable to load the authors catalogue.'
  }
}

onMounted(getApiData)

defineExpose({ getApiData })
</script>

<template>
  <section class="page-wrap json-api-page" aria-labelledby="count-api-heading">
    <header class="api-heading">
      <div>
        <p class="eyebrow">Lab 10 - Local JSON API</p>
        <h1 id="count-api-heading" class="page-title text-start">CountBookAPI</h1>
        <p class="page-lead">
          A formatted API-style response calculated from
          <code>src/assets/json/authors.json</code>.
        </p>
      </div>
      <span class="endpoint-badge">GET /CountBookAPI</span>
    </header>

    <div v-if="apiResponse" class="stats-grid" aria-label="Catalogue totals">
      <article class="stat-card authors-card">
        <span>Number of authors</span>
        <strong>{{ apiResponse.data.authorsCount }}</strong>
        <small>records in authors.json</small>
      </article>
      <article class="stat-card books-card">
        <span>Number of books</span>
        <strong>{{ apiResponse.data.totalBooks }}</strong>
        <small>famous works in total</small>
      </article>
    </div>

    <div v-if="apiResponse" class="json-response surface-card" aria-label="CountBookAPI JSON response">
      <div class="response-toolbar">
        <span><i aria-hidden="true"></i> 200 OK</span>
        <strong>application/json</strong>
      </div>
      <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </div>

    <p v-else-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</p>
  </section>
</template>

<style scoped>
.json-api-page {
  padding-top: 2.8rem;
}

.api-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.api-heading code {
  color: #086f77;
  font-weight: 700;
}

.endpoint-badge {
  flex: 0 0 auto;
  margin-top: 0.55rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid #b8d8e7;
  border-radius: 0.6rem;
  color: #174f63;
  background: #f2fbfc;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 0.78rem;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 1.25rem 1.4rem;
  border: 1px solid #d9e2ec;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 10px 24px rgba(16, 42, 67, 0.07);
}

.stat-card span {
  color: #486581;
  font-weight: 800;
}

.stat-card strong {
  grid-row: span 2;
  color: #102a43;
  font-size: 3.2rem;
  line-height: 1;
}

.stat-card small {
  color: #829ab1;
}

.authors-card {
  border-left: 5px solid #0d8b92;
}

.books-card {
  border-left: 5px solid #f1b44c;
}

.json-response {
  overflow: hidden;
}

.response-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  color: #cbd5e1;
  background: #172b3a;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 0.78rem;
}

.response-toolbar span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #b9f6ca;
}

.response-toolbar i {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: #32d583;
}

pre {
  max-height: 500px;
  margin: 0;
  overflow: auto;
  padding: 1.25rem 1.4rem;
  color: #d7f5ff;
  background: #102a43;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 0.86rem;
  line-height: 1.55;
}

@media (max-width: 767.98px) {
  .json-api-page {
    padding-top: 1.5rem;
  }

  .api-heading {
    flex-direction: column;
    gap: 0.3rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  pre {
    font-size: 0.74rem;
  }
}
</style>
