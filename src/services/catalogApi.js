import authors from '../assets/json/authors.json'

const safeWorks = (author) => (Array.isArray(author?.famousWorks) ? author.famousWorks : [])

export const calculateCatalogStats = (authorData = authors) => {
  const safeAuthors = Array.isArray(authorData) ? authorData : []

  return {
    authorsCount: safeAuthors.length,
    totalBooks: safeAuthors.reduce((total, author) => total + safeWorks(author).length, 0),
    authors: safeAuthors.map((author) => ({
      name: author?.name,
      bookCount: safeWorks(author).length
    }))
  }
}

export const flattenBooks = (authorData = authors) => {
  const safeAuthors = Array.isArray(authorData) ? authorData : []

  return safeAuthors.flatMap((author) =>
    safeWorks(author).map((book) => ({
      title: book.title,
      year: book.year,
      author: author.name
    }))
  )
}

export const buildCountBookResponse = (authorData = authors, timestamp = new Date()) => ({
  success: true,
  data: calculateCatalogStats(authorData),
  timestamp: timestamp.toISOString()
})

export const buildAllBooksResponse = (authorData = authors, timestamp = new Date()) => {
  const books = flattenBooks(authorData)

  return {
    success: true,
    data: {
      totalBooks: books.length,
      books
    },
    timestamp: timestamp.toISOString()
  }
}
