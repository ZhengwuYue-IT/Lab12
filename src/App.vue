<script setup>
import BHeader from './components/BHeader.vue'
</script>

<template>
  <div class="app-shell">
    <BHeader />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <footer class="app-footer">
      <div class="container d-flex flex-column flex-md-row justify-content-between gap-2">
        <span>NoMash Library - Week 10 API Services Lab</span>
        <span>FIT5032 Internet Applications Development</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.app-footer {
  margin-top: 3rem;
  padding: 1.25rem 0;
  color: #dbe7f3;
  background: #102a43;
  font-size: 0.9rem;
}
</style>
