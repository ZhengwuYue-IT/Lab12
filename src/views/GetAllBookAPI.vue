<script setup>
import { onMounted, ref } from 'vue'
import { buildAllBooksResponse } from '../services/catalogApi'

const apiResponse = ref(null)
const errorMessage = ref('')

const getApiData = () => {
  try {
    apiResponse.value = buildAllBooksResponse()
    errorMessage.value = ''
  } catch (error) {
    console.error('[GetAllBookAPI] Unable to build the response:', error)
    errorMessage.value = 'Unable to load the books catalogue.'
  }
}

onMounted(getApiData)

defineExpose({ getApiData })
</script>

<template>
  <section class="page-wrap all-books-page" aria-labelledby="all-books-heading">
    <header class="api-heading">
      <div>
        <p class="eyebrow">Lab 10 - Local JSON API</p>
        <h1 id="all-books-heading" class="page-title text-start">GetAllBookAPI</h1>
        <p class="page-lead">
          All famous works from <code>authors.json</code>, flattened into book records with their
          authors.
        </p>
      </div>
      <div class="endpoint-summary">
        <span>GET /GetAllBookAPI</span>
        <strong v-if="apiResponse">{{ apiResponse.data.totalBooks }} books</strong>
      </div>
    </header>

    <div v-if="apiResponse" class="json-response surface-card" aria-label="All books JSON response">
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
.all-books-page {
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

.endpoint-summary {
  display: grid;
  flex: 0 0 auto;
  gap: 0.3rem;
  margin-top: 0.55rem;
  text-align: right;
}

.endpoint-summary span {
  padding: 0.5rem 0.8rem;
  border: 1px solid #b8d8e7;
  border-radius: 0.6rem;
  color: #174f63;
  background: #f2fbfc;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 0.78rem;
  font-weight: 700;
}

.endpoint-summary strong {
  color: #087f8c;
  font-size: 0.83rem;
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
  margin: 0;
  overflow: auto;
  padding: 1.15rem 1.4rem 1.35rem;
  color: #d7f5ff;
  background: #102a43;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.42;
}

@media (max-width: 767.98px) {
  .all-books-page {
    padding-top: 1.5rem;
  }

  .api-heading {
    flex-direction: column;
    gap: 0.3rem;
  }

  .endpoint-summary {
    text-align: left;
  }

  pre {
    font-size: 0.69rem;
  }
}
</style>
