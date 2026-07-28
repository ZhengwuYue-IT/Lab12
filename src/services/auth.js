import { computed, ref } from 'vue'
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'

export const ROLE_OPTIONS = Object.freeze([
  { value: 'Member', label: 'Member', description: 'Browse member-only library resources.' },
  { value: 'Librarian', label: 'Librarian', description: 'Open the library management workspace.' }
])

export const currentUser = ref(null)
export const currentRole = computed(() => currentUser.value?.displayName ?? '')
export const isAuthenticated = computed(() => Boolean(currentUser.value))

let authInstance = null
let authReadyResolved = false
let resolveAuthReady

export const authReady = new Promise((resolve) => {
  resolveAuthReady = resolve
})

const requireAuth = () => {
  if (!authInstance) {
    throw new Error('Firebase Authentication has not been initialised.')
  }

  return authInstance
}

const isSupportedRole = (role) => ROLE_OPTIONS.some((option) => option.value === role)

const describeUser = (user) =>
  user ? `${user.email ?? 'unknown email'} | role: ${user.displayName || 'unassigned'}` : 'null'

export const initializeAuth = (firebaseApp) => {
  if (authInstance) return authInstance

  authInstance = getAuth(firebaseApp)
  onAuthStateChanged(
    authInstance,
    (user) => {
      currentUser.value = user
      console.info('[Firebase Auth] Current user:', describeUser(user))

      if (!authReadyResolved) {
        authReadyResolved = true
        resolveAuthReady(user)
      }
    },
    (error) => {
      console.error('[Firebase Auth] State observer failed:', error.code)

      if (!authReadyResolved) {
        authReadyResolved = true
        resolveAuthReady(null)
      }
    }
  )

  return authInstance
}

export const registerUser = async (email, password, role) => {
  if (!isSupportedRole(role)) {
    const error = new Error('Please select a valid library role.')
    error.code = 'auth/invalid-role'
    throw error
  }

  const auth = requireAuth()
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  await updateProfile(credential.user, { displayName: role })

  const registeredUser = {
    uid: credential.user.uid,
    email: credential.user.email,
    role
  }

  console.info(
    '[Firebase Auth] Registered user:',
    `${registeredUser.email} | role: ${registeredUser.role}`
  )

  // Firebase signs a new account in automatically. End that session so the
  // learner can demonstrate the separate sign-in process required by Lab 7.
  await signOut(auth)
  return registeredUser
}

export const signInUser = async (email, password, role) => {
  if (!isSupportedRole(role)) {
    const error = new Error('Please select a valid library role.')
    error.code = 'auth/invalid-role'
    throw error
  }

  const auth = requireAuth()
  await setPersistence(auth, browserSessionPersistence)

  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  const registeredRole = credential.user.displayName ?? ''

  if (registeredRole !== role) {
    await signOut(auth)
    const error = new Error(`This account is registered as ${registeredRole || 'an unknown role'}.`)
    error.code = 'auth/role-mismatch'
    throw error
  }

  currentUser.value = credential.user
  console.info('[Firebase Auth] Current Firebase user:', describeUser(credential.user))
  return credential.user
}

export const signOutUser = async () => {
  const auth = requireAuth()
  console.info('[Firebase Auth] User before sign out:', describeUser(auth.currentUser))
  await signOut(auth)
  currentUser.value = null
  console.info('[Firebase Auth] Current user after sign out:', describeUser(auth.currentUser))
}

export const getAuthErrorMessage = (error) => {
  const messages = {
    'auth/email-already-in-use': 'This email address is already registered.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/invalid-credential': 'The email address or password is incorrect.',
    'auth/invalid-role': 'Select either Member or Librarian.',
    'auth/network-request-failed': 'Firebase could not be reached. Check your internet connection.',
    'auth/role-mismatch': error?.message ?? 'The selected role does not match this account.',
    'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
    'auth/weak-password': 'Use a password containing at least six characters.'
  }

  return messages[error?.code] ?? 'Authentication could not be completed. Please try again.'
}
