<script setup>
import { onMounted, ref } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore'
import { db } from '../Firebase/init'
import { getFirestoreErrorMessage } from '../Firebase/firestoreErrors'

const books = ref([])
const isLoading = ref(false)
const activeOperationId = ref('')
const editingId = ref('')
const editIsbn = ref('')
const editName = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const loadBooks = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const booksQuery = query(
      collection(db, 'books'),
      where('isbn', '>', 1000),
      orderBy('isbn', 'asc'),
      limit(5)
    )
    const snapshot = await getDocs(booksQuery)
    books.value = snapshot.docs.map((bookDocument) => ({
      id: bookDocument.id,
      ...bookDocument.data()
    }))
  } catch (error) {
    console.error('[Firestore] Retrieve books failed:', error.code)
    errorMessage.value = getFirestoreErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

const beginEdit = (book) => {
  editingId.value = book.id
  editIsbn.value = String(book.isbn)
  editName.value = book.name
  successMessage.value = ''
  errorMessage.value = ''
}

const cancelEdit = () => {
  editingId.value = ''
  editIsbn.value = ''
  editName.value = ''
}

const saveBook = async (bookId) => {
  successMessage.value = ''
  errorMessage.value = ''

  const numericIsbn = Number(editIsbn.value)
  const trimmedName = editName.value.trim()

  if (!Number.isSafeInteger(numericIsbn) || numericIsbn <= 0 || !trimmedName) {
    errorMessage.value = 'Enter a positive whole-number ISBN and a book name.'
    return
  }

  activeOperationId.value = bookId

  try {
    await updateDoc(doc(db, 'books', bookId), {
      isbn: numericIsbn,
      name: trimmedName
    })
    cancelEdit()
    successMessage.value = `Book ${numericIsbn} updated successfully.`
    await loadBooks()
  } catch (error) {
    console.error('[Firestore] Update book failed:', error.code)
    errorMessage.value = getFirestoreErrorMessage(error)
  } finally {
    activeOperationId.value = ''
  }
}

const removeBook = async (book) => {
  const confirmed = window.confirm(`Delete “${book.name}” from Firestore?`)
  if (!confirmed) return

  activeOperationId.value = book.id
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await deleteDoc(doc(db, 'books', book.id))
    successMessage.value = `“${book.name}” deleted successfully.`
    await loadBooks()
  } catch (error) {
    console.error('[Firestore] Delete book failed:', error.code)
    errorMessage.value = getFirestoreErrorMessage(error)
  } finally {
    activeOperationId.value = ''
  }
}

onMounted(loadBooks)
defineExpose({ loadBooks })
</script>

<template>
  <section class="surface-card book-list-card mt-4" aria-labelledby="book-list-heading">
    <div class="list-heading">
      <div>
        <p class="section-kicker">Read, update and delete</p>
        <h2 id="book-list-heading" class="h4 mb-1">Queried Firestore books</h2>
        <p class="text-secondary mb-0">
          Results are filtered, ordered and limited by a modular Firestore query.
        </p>
      </div>
      <button class="btn btn-outline-primary btn-sm" type="button" :disabled="isLoading" @click="loadBooks">
        {{ isLoading ? 'Loading...' : 'Refresh data' }}
      </button>
    </div>

    <div class="p-4">
      <div class="query-summary" aria-label="Firestore query conditions">
        <span><strong>where</strong> isbn &gt; 1000</span>
        <span><strong>orderBy</strong> isbn ascending</span>
        <span><strong>limit</strong> 5 records</span>
        <span class="result-count">{{ books.length }} result(s)</span>
      </div>

      <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <div v-if="isLoading && books.length === 0" class="empty-state" role="status">
        Loading books from Firestore...
      </div>

      <div v-else-if="books.length === 0" class="empty-state">
        No books are available yet. Add the first Firestore document above.
      </div>

      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Document ID</th>
              <th scope="col">ISBN</th>
              <th scope="col">Book name</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.id">
              <td><code class="document-id" :title="book.id">{{ book.id }}</code></td>
              <template v-if="editingId === book.id">
                <td>
                  <input
                    v-model="editIsbn"
                    class="form-control form-control-sm"
                    type="number"
                    min="1"
                    step="1"
                    aria-label="Edit ISBN"
                  />
                </td>
                <td>
                  <input
                    v-model="editName"
                    class="form-control form-control-sm"
                    type="text"
                    maxlength="120"
                    aria-label="Edit book name"
                  />
                </td>
                <td>
                  <div class="d-flex justify-content-end gap-2">
                    <button
                      class="btn btn-success btn-sm"
                      type="button"
                      :disabled="activeOperationId === book.id"
                      @click="saveBook(book.id)"
                    >
                      Save
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" type="button" @click="cancelEdit">
                      Cancel
                    </button>
                  </div>
                </td>
              </template>
              <template v-else>
                <td>{{ book.isbn }}</td>
                <td>{{ book.name }}</td>
                <td>
                  <div class="d-flex justify-content-end gap-2">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      type="button"
                      :disabled="Boolean(activeOperationId)"
                      @click="beginEdit(book)"
                    >
                      Edit
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      type="button"
                      :disabled="Boolean(activeOperationId)"
                      @click="removeBook(book)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.book-list-card {
  overflow: hidden;
}

.list-heading {
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

.query-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.query-summary span {
  padding: 0.36rem 0.68rem;
  border: 1px solid #b9dce0;
  border-radius: 999px;
  color: #075d63;
  background: #e9f7f7;
  font-size: 0.76rem;
}

.query-summary strong {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.query-summary .result-count {
  margin-left: auto;
  border-color: #c8d3df;
  color: #334e68;
  background: #f4f7fa;
  font-weight: 800;
}

.document-id {
  display: inline-block;
  max-width: 10rem;
  overflow: hidden;
  color: #7a306c;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
}

.empty-state {
  padding: 2rem 1rem;
  border: 1px dashed #bcccdc;
  border-radius: 0.8rem;
  color: #627d98;
  background: #f8fbfd;
  text-align: center;
}

th {
  color: #334e68;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 767.98px) {
  .list-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
