export const getFirestoreErrorMessage = (error) => {
  const code = error?.code?.replace('firestore/', '')
  const messages = {
    'failed-precondition': 'Firestore is not ready. Confirm that the database has been created.',
    'permission-denied': 'Firestore access was denied. Confirm that the tutorial rules allow access.',
    unavailable: 'Firestore is temporarily unavailable. Check your connection and try again.'
  }

  return messages[code] ?? 'The Firestore operation could not be completed. Please try again.'
}
