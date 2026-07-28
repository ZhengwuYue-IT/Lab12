import { describe, expect, it } from 'vitest'
import {
  buildAllBooksResponse,
  buildCountBookResponse,
  calculateCatalogStats,
  flattenBooks
} from './catalogApi'

const timestamp = new Date('2026-07-28T00:00:00.000Z')

describe('catalog API responses', () => {
  it('counts the three authors and six famous works', () => {
    const stats = calculateCatalogStats()

    expect(stats.authorsCount).toBe(3)
    expect(stats.totalBooks).toBe(6)
    expect(stats.authors).toEqual([
      { name: 'Jane Austen', bookCount: 2 },
      { name: 'George Orwell', bookCount: 2 },
      { name: 'Agatha Christie', bookCount: 2 }
    ])
  })

  it('flattens every book and retains its author', () => {
    const books = flattenBooks()

    expect(books).toHaveLength(6)
    expect(books[0]).toEqual({
      title: 'Pride and Prejudice',
      year: 1813,
      author: 'Jane Austen'
    })
    expect(books.at(-1)).toEqual({
      title: 'Death on the Nile',
      year: 1937,
      author: 'Agatha Christie'
    })
    expect(books.every((book) => book.author)).toBe(true)
  })

  it('builds stable API envelopes with ISO timestamps', () => {
    const countResponse = buildCountBookResponse(undefined, timestamp)
    const allBooksResponse = buildAllBooksResponse(undefined, timestamp)

    expect(countResponse).toMatchObject({
      success: true,
      data: { authorsCount: 3, totalBooks: 6 },
      timestamp: '2026-07-28T00:00:00.000Z'
    })
    expect(allBooksResponse.data.totalBooks).toBe(6)
    expect(allBooksResponse.timestamp).toBe('2026-07-28T00:00:00.000Z')
  })

  it('handles malformed or missing famousWorks arrays safely', () => {
    const stats = calculateCatalogStats([{ name: 'Example' }, null])

    expect(stats).toEqual({
      authorsCount: 2,
      totalBooks: 0,
      authors: [
        { name: 'Example', bookCount: 0 },
        { name: undefined, bookCount: 0 }
      ]
    })
  })
})
