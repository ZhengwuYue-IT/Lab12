'use strict'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
}

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(payload)
})

const parseEvent = (event) => {
  if (event && typeof event === 'object' && !Buffer.isBuffer(event)) return event
  return JSON.parse(Buffer.from(event).toString('utf8'))
}

const parseRequestBody = (request) => {
  if (!request.body) return null
  const decodedBody = request.isBase64Encoded
    ? Buffer.from(request.body, 'base64').toString('utf8')
    : request.body
  return typeof decodedBody === 'string' ? JSON.parse(decodedBody) : decodedBody
}

exports.handler = async (event) => {
  try {
    const request = parseEvent(event)
    const method = request.requestContext?.http?.method ?? request.httpMethod ?? 'POST'

    if (method !== 'POST') {
      return jsonResponse(405, { ok: false, error: 'Method not allowed.' })
    }

    const payload = parseRequestBody(request)
    const suppliedBooks = payload?.books

    if (!Array.isArray(suppliedBooks) || suppliedBooks.length > 100) {
      return jsonResponse(400, { ok: false, error: 'A books array with at most 100 items is required.' })
    }

    const books = suppliedBooks.map((book) => ({
      isbn: Number(book?.isbn),
      name: typeof book?.name === 'string' ? book.name.trim() : ''
    }))

    if (books.some((book) => !Number.isFinite(book.isbn) || !book.name)) {
      return jsonResponse(400, { ok: false, error: 'Every book requires a numeric ISBN and name.' })
    }

    books.sort((firstBook, secondBook) => firstBook.isbn - secondBook.isbn)
    const isbnValues = books.map((book) => book.isbn)

    return jsonResponse(200, {
      ok: true,
      platform: 'Alibaba Cloud Function Compute',
      region: 'cn-hangzhou',
      source: 'Cloud Firestore books collection via Vue',
      total: books.length,
      books,
      summary: {
        minIsbn: isbnValues.length ? Math.min(...isbnValues) : null,
        maxIsbn: isbnValues.length ? Math.max(...isbnValues) : null
      },
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('bookInsights failed:', error)
    return jsonResponse(500, { ok: false, error: 'Unable to build book insights.' })
  }
}
