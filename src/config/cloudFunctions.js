export const cloudFunctionUrls = Object.freeze({
  countBooks: import.meta.env.VITE_COUNT_BOOKS_URL?.trim() ?? '',
  bookInsights: import.meta.env.VITE_BOOK_INSIGHTS_URL?.trim() ?? ''
})
