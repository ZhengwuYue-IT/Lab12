<script setup>
import { ref } from 'vue'
import { addDoc, collection } from 'firebase/firestore'
import BookList from '../components/BookList.vue'
import { db } from '../Firebase/init'
import { getFirestoreErrorMessage } from '../Firebase/firestoreErrors'

const isbn = ref('')
const name = ref('')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const bookListRef = ref(null)

const addBook = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  const numericIsbn = Number(isbn.value)
  const trimmedName = name.value.trim()

  if (!Number.isSafeInteger(numericIsbn) || numericIsbn <= 0) {
    errorMessage.value = 'ISBN must be a positive whole number.'
    return
  }

  if (!trimmedName) {
    errorMessage.value = 'Book name is required.'
    return
  }

  isSubmitting.value = true

  try {
    const documentReference = await addDoc(collection(db, 'books'), {
      isbn: numericIsbn,
      name: trimmedName
    })

    successMessage.value = `Book added successfully. Document ID: ${documentReference.id}`
    isbn.value = ''
    name.value = ''
    await bookListRef.value?.loadBooks()
  } catch (error) {
    console.error('[Firestore] Add book failed:', error.code)
    errorMessage.value = getFirestoreErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page-wrap">
    <section class="add-book-hero">
      <div>
        <p class="eyebrow">Week 8 - Cloud Firestore</p>
        <h1 class="page-title">Add a Book</h1>
        <p class="page-lead mb-0">
          Create, retrieve, update and delete NoMash Library records stored in the
          <code>books</code> collection.
        </p>
      </div>
      <div class="firestore-badge" aria-label="Firestore connection">
        <span class="status-dot" aria-hidden="true"></span>
        Firebase Firestore
      </div>
    </section>

    <section class="surface-card add-book-card mt-4" aria-labelledby="add-book-heading">
      <div class="card-heading">
        <div>
          <p class="section-kicker">Create document</p>
          <h2 id="add-book-heading" class="h4 mb-1">New library book</h2>
          <p class="text-secondary mb-0">
            Both fields are required. ISBN is stored as a Firestore number.
          </p>
        </div>
        <span class="collection-chip">books</span>
      </div>

      <form class="p-4" novalidate @submit.prevent="addBook">
        <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label for="book-isbn" class="form-label">ISBN</label>
            <input
              id="book-isbn"
              v-model="isbn"
              class="form-control"
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              placeholder="e.g. 1500"
              required
            />
          </div>

          <div class="col-md-5">
            <label for="book-name" class="form-label">Book name</label>
            <input
              id="book-name"
              v-model="name"
              class="form-control"
              type="text"
              maxlength="120"
              placeholder="e.g. Firestore in Practice"
              required
            />
          </div>

          <div class="col-md-3 d-grid">
            <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding book...' : 'Add to Firestore' }}
            </button>
          </div>
        </div>
      </form>
    </section>

    <BookList ref="bookListRef" />
  </div>
</template>

<style scoped>
.add-book-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.firestore-badge,
.collection-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #f0c15a;
  border-radius: 999px;
  color: #6a4300;
  background: #fff7df;
  font-weight: 800;
  white-space: nowrap;
}

.firestore-badge {
  padding: 0.65rem 0.9rem;
  font-size: 0.82rem;
}

.collection-chip {
  padding: 0.35rem 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem;
}

.status-dot {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 0 0.25rem rgba(245, 158, 11, 0.15);
}

.add-book-card {
  overflow: hidden;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #d9e2ec;
  background: linear-gradient(100deg, #fffdf7, #fff7df);
}

.section-kicker {
  margin: 0 0 0.25rem;
  color: #9a5d00;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

code {
  color: #7a306c;
}

@media (max-width: 767.98px) {
  .add-book-hero,
  .card-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
