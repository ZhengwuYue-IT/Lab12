<script setup>
import { computed } from 'vue'
import { currentRole, currentUser } from '../services/auth'

const isLibrarian = computed(() => currentRole.value === 'Librarian')

const workspaceCards = computed(() =>
  isLibrarian.value
    ? [
        {
          number: '01',
          title: 'Catalogue review',
          description: 'Review new titles and maintain accurate catalogue information.'
        },
        {
          number: '02',
          title: 'Member support',
          description: 'Help members access borrowing and digital library services.'
        },
        {
          number: '03',
          title: 'Program planning',
          description: 'Coordinate inclusive events and community learning programs.'
        }
      ]
    : [
        {
          number: '01',
          title: 'My collection',
          description: 'Browse books, journals and digital resources selected for members.'
        },
        {
          number: '02',
          title: 'Member services',
          description: 'Explore reading lists, borrowing support and learning assistance.'
        },
        {
          number: '03',
          title: 'Community',
          description: 'Discover programs connecting readers and community partners.'
        }
      ]
)
</script>

<template>
  <div class="page-wrap">
    <section class="member-hero surface-card" :class="{ 'librarian-theme': isLibrarian }">
      <div class="member-copy">
        <p class="eyebrow">Protected Firebase route</p>
        <span class="secure-badge">Authentication confirmed</span>
        <h1 class="page-title mt-3">{{ currentRole }} workspace</h1>
        <p class="account-line">Signed in as {{ currentUser?.email }}</p>
        <p class="page-lead">
          <template v-if="isLibrarian">
            Firebase verified this Librarian account. The management workspace is now available.
          </template>
          <template v-else>
            Firebase verified this Member account. Member-only library services are now available.
          </template>
        </p>
        <div class="d-flex flex-wrap gap-2 mt-4">
          <router-link to="/" class="btn btn-primary px-4">Return home</router-link>
          <router-link :to="{ name: 'FireLogout' }" class="btn btn-outline-secondary px-4">
            Open logout page
          </router-link>
          <span class="session-chip">Session: authenticated</span>
        </div>
      </div>
      <div class="secure-illustration" aria-hidden="true">
        <div class="shield">{{ isLibrarian ? 'LIB' : 'MEM' }}</div>
        <strong>{{ currentRole }} access granted</strong>
      </div>
    </section>

    <section class="row g-4 mt-1" :aria-label="`${currentRole} workspace options`">
      <div v-for="card in workspaceCards" :key="card.number" class="col-md-4">
        <article class="info-card h-100">
          <span class="info-number">{{ card.number }}</span>
          <h2 class="h5">{{ card.title }}</h2>
          <p>{{ card.description }}</p>
        </article>
      </div>
    </section>

    <p class="security-note">
      Lab note: the role is stored in the Firebase display name for this client-side learning
      activity. Production authorisation would require trusted backend enforcement.
    </p>
  </div>
</template>

<style scoped>
.member-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
  overflow: hidden;
}

.member-copy {
  padding: clamp(2rem, 6vw, 4.5rem);
}

.secure-badge,
.session-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-weight: 700;
}

.secure-badge {
  padding: 0.35rem 0.7rem;
  color: #087f5b;
  background: #d9f7e9;
  font-size: 0.78rem;
  text-transform: uppercase;
}

.account-line {
  margin-bottom: 0.6rem;
  color: #6b3f78;
  font-weight: 800;
}

.session-chip {
  padding: 0.5rem 0.85rem;
  color: #285a43;
  background: #e6f6ed;
  font-size: 0.85rem;
}

.secure-illustration {
  display: grid;
  min-width: 0;
  min-height: 360px;
  padding: 1.5rem;
  place-content: center;
  gap: 1rem;
  color: white;
  background: linear-gradient(rgba(8, 111, 119, 0.92), rgba(16, 42, 67, 0.96)),
    repeating-linear-gradient(45deg, transparent 0 16px, rgba(255, 255, 255, 0.08) 16px 32px);
  text-align: center;
}

.secure-illustration strong {
  max-width: 220px;
  overflow-wrap: anywhere;
}

.librarian-theme .secure-illustration {
  background: linear-gradient(rgba(107, 63, 120, 0.94), rgba(39, 30, 74, 0.97)),
    repeating-linear-gradient(45deg, transparent 0 16px, rgba(255, 255, 255, 0.08) 16px 32px);
}

.shield {
  display: grid;
  width: 118px;
  height: 132px;
  margin: 0 auto;
  place-items: center;
  border: 4px solid #ffca58;
  border-radius: 52% 52% 62% 62% / 35% 35% 70% 70%;
  color: #ffca58;
  font-size: 1.45rem;
  font-weight: 900;
}

.info-card {
  padding: 1.5rem;
  border: 1px solid #d9e2ec;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.88);
}

.info-number {
  display: block;
  margin-bottom: 1rem;
  color: #087f8c;
  font-weight: 800;
}

.info-card p,
.security-note {
  color: #627d98;
}

.info-card p {
  margin: 0;
}

.security-note {
  max-width: 900px;
  margin: 1.5rem auto 0;
  font-size: 0.83rem;
  text-align: center;
}

@media (max-width: 767.98px) {
  .member-hero {
    grid-template-columns: 1fr;
  }

  .secure-illustration {
    min-height: 260px;
  }
}
</style>
