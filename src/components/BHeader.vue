<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { currentRole, currentUser, isAuthenticated } from '../services/auth'

const route = useRoute()
const lab10Routes = ['GetWeather', 'CountBookAPI', 'GetAllBookAPI']
const isLab10Route = computed(() => lab10Routes.includes(route.name))
</script>

<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-xl" aria-label="Primary navigation">
      <div class="container">
        <router-link class="navbar-brand d-flex align-items-center gap-2" to="/">
          <span class="brand-mark" aria-hidden="true">NL</span>
          <span>
            <strong>NoMash Library</strong>
            <small class="d-block">Member learning portal</small>
          </span>
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#primaryNav"
          aria-controls="primaryNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="primaryNav" class="collapse navbar-collapse justify-content-end">
          <ul class="navbar-nav align-items-md-center gap-md-1">
            <li class="nav-item">
              <router-link to="/" class="nav-link" exact-active-class="active">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link" active-class="active">
                Workspace <span v-if="!isAuthenticated" class="lock-label">Locked</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'AddBook' }" class="nav-link" active-class="active">
                Add Book
              </router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'BookCounter' }" class="nav-link" active-class="active">
                Book Counter
              </router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'BookInsights' }" class="nav-link" active-class="active">
                Book Insights
              </router-link>
            </li>
            <li class="nav-item dropdown">
              <button
                class="nav-link dropdown-toggle"
                :class="{ active: isLab10Route }"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Lab 10 APIs
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link
                    :to="{ name: 'GetWeather' }"
                    class="dropdown-item"
                    active-class="active"
                  >
                    Get Weather
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ name: 'CountBookAPI' }"
                    class="dropdown-item"
                    active-class="active"
                  >
                    Count Book API
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ name: 'GetAllBookAPI' }"
                    class="dropdown-item"
                    active-class="active"
                  >
                    Get All Book API
                  </router-link>
                </li>
              </ul>
            </li>
            <template v-if="!isAuthenticated">
              <li class="nav-item">
                <router-link :to="{ name: 'FireRegister' }" class="nav-link" active-class="active">
                  Firebase Register
                </router-link>
              </li>
              <li class="nav-item ms-md-2">
                <router-link :to="{ name: 'FireSignIn' }" class="btn btn-outline-light btn-sm px-3">
                  Firebase Sign In
                </router-link>
              </li>
            </template>
            <li v-else class="nav-item ms-md-2 d-flex align-items-md-center gap-2">
              <span class="member-name">
                {{ currentUser.email }}
                <strong class="role-label">{{ currentRole }}</strong>
              </span>
              <router-link :to="{ name: 'FireLogout' }" class="btn btn-warning btn-sm px-3">
                Log out
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  color: white;
  background: linear-gradient(110deg, #102a43, #174f63);
  box-shadow: 0 4px 18px rgba(15, 42, 67, 0.2);
}

.navbar {
  min-height: 76px;
}

.navbar-brand,
.nav-link,
.member-name {
  color: #fff;
}

.navbar-brand:hover,
.navbar-brand:focus,
.nav-link:hover,
.nav-link:focus {
  color: #fff;
}

.navbar-brand small {
  color: #b8d8e7;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  color: #102a43;
  background: #ffca58;
  font-weight: 800;
}

.nav-link {
  border-radius: 0.55rem;
  padding: 0.48rem 0.8rem !important;
}

.nav-link.active {
  color: #102a43;
  background: #fff;
  font-weight: 700;
}

.lock-label {
  margin-left: 0.25rem;
  padding: 0.1rem 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 999px;
  font-size: 0.65rem;
  text-transform: uppercase;
}

.member-name {
  font-size: 0.78rem;
}

.role-label {
  display: inline-flex;
  margin-left: 0.35rem;
  padding: 0.12rem 0.42rem;
  border-radius: 999px;
  color: #102a43;
  background: #ffca58;
  font-size: 0.68rem;
}

.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.92);
}

.dropdown-toggle {
  border: 0;
  background: transparent;
}

.dropdown-menu {
  min-width: 210px;
  padding: 0.45rem;
  border: 1px solid #d9e2ec;
  border-radius: 0.75rem;
  box-shadow: 0 14px 30px rgba(16, 42, 67, 0.18);
}

.dropdown-item {
  border-radius: 0.45rem;
  color: #243b53;
  font-weight: 650;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: #102a43;
  background: #eaf8f8;
}

.dropdown-item.active {
  color: white;
  background: #086f77;
}
</style>
