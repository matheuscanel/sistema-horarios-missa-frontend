<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'

const auth = useAuthStore()
</script>

<template>
  <header class="main-header">
    <div class="container nav-container">
      <RouterLink to="/" class="logo">
        <span class="icon">⛪</span>
        <span class="text">MissasPE</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/" class="nav-link">Início</RouterLink>
        
        <template v-if="auth.isAuthenticated">
          <RouterLink v-if="auth.isParoquia" to="/dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin" class="nav-link">Admin</RouterLink>
          
          <div class="user-menu">
            <span class="user-name">Olá, {{ auth.user?.name }}</span>
            <button @click="auth.logout" class="btn btn-outline btn-sm">Sair</button>
          </div>
        </template>
        
        <template v-else>
          <RouterLink to="/login" class="nav-link">Entrar</RouterLink>
          <RouterLink to="/registro" class="btn btn-primary">Cadastrar Paróquia</RouterLink>
        </template>
      </nav>
    </div>
  </header>

  <main class="main-content">
    <RouterView />
  </main>

  <footer class="main-footer">
    <div class="container">
      <p>&copy; 2026 MissasPE - Encontre horários de missas perto de você.</p>
    </div>
  </footer>

  <ToastContainer />
</template>

<style scoped>
.main-header {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo .icon { font-size: 1.5rem; }
.logo .text {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.025em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.nav-link:hover, .router-link-active {
  color: var(--primary);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 1rem;
  border-left: 1px solid var(--border);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.main-footer {
  padding: 2rem 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
  border-top: 1px solid var(--border);
  background: white;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
}
</style>
