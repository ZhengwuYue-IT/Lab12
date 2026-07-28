import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Firebase web configuration for the existing FIT5032 Lab 7/8 project.
// This identifies the Firebase project and is safe to use in client-side code.
const firebaseConfig = {
  apiKey: 'AIzaSyD4koZcQiSwa7xbiavEPKXTK1feLJ3fp8k',
  authDomain: 'fit5032-lab-7-36668672.firebaseapp.com',
  projectId: 'fit5032-lab-7-36668672',
  storageBucket: 'fit5032-lab-7-36668672.firebasestorage.app',
  messagingSenderId: '474629655001',
  appId: '1:474629655001:web:a2bee22f44a6a1c0dc31c8',
  measurementId: 'G-DX69NK8KXR'
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

export default db
