import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import AccessDeniedView from '../views/AccessDeniedView.vue'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import FirebaseSigninView from '../views/FirebaseSigninView.vue'
import FirebaseSignoutView from '../views/FirebaseSignoutView.vue'
import AddBookView from '../views/AddBookView.vue'
import GetBookCountView from '../views/GetBookCountView.vue'
import BookInsightsView from '../views/BookInsightsView.vue'
import WeatherView from '../views/WeatherView.vue'
import CountBookAPI from '../views/CountBookAPI.vue'
import GetAllBookAPI from '../views/GetAllBookAPI.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { authReady, isAuthenticated } from '../services/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Home' }
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: { title: 'Role Workspace', requiresAuth: true }
  },
  {
    path: '/login',
    redirect: { name: 'FireSignIn' }
  },
  {
    path: '/FireRegister',
    name: 'FireRegister',
    component: FirebaseRegisterView,
    meta: { title: 'Firebase Registration', guestOnly: true }
  },
  {
    path: '/FireSignIn',
    name: 'FireSignIn',
    component: FirebaseSigninView,
    meta: { title: 'Firebase Sign In', guestOnly: true }
  },
  {
    path: '/FireLogout',
    name: 'FireLogout',
    component: FirebaseSignoutView,
    meta: { title: 'Firebase Logout', requiresAuth: true }
  },
  {
    path: '/addbook',
    name: 'AddBook',
    component: AddBookView,
    meta: { title: 'Firestore Books' }
  },
  {
    path: '/book-counter',
    name: 'BookCounter',
    component: GetBookCountView,
    meta: { title: 'Book Counter' }
  },
  {
    path: '/book-insights',
    name: 'BookInsights',
    component: BookInsightsView,
    meta: { title: 'Book Insights' }
  },
  {
    path: '/WeatherCheck',
    name: 'GetWeather',
    component: WeatherView,
    meta: { title: 'Get Weather' }
  },
  {
    path: '/CountBookAPI',
    name: 'CountBookAPI',
    component: CountBookAPI,
    meta: { title: 'Count Book API' }
  },
  {
    path: '/GetAllBookAPI',
    name: 'GetAllBookAPI',
    component: GetAllBookAPI,
    meta: { title: 'Get All Book API' }
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AccessDeniedView,
    meta: { title: 'Access Denied' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  await authReady

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return {
      name: 'FireSignIn',
      query: { redirect: to.fullPath, denied: '1' }
    }
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'About' }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Library'} | NoMash Library`
})

export default router
