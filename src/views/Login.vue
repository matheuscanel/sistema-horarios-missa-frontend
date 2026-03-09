<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  const success = await auth.login({
    email: email.value,
    password: password.value
  });
  
  if (success) {
    if (auth.isAdmin) router.push('/admin');
    else router.push('/dashboard');
  }
};
</script>

<template>
  <div class="auth-page container fade-in">
    <div class="auth-card card">
      <div class="auth-header">
        <h1>Entrar</h1>
        <p>Acesse seu painel para gerenciar os horários.</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="seu@email.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <div v-if="auth.error" class="error-msg card btn-danger">
          {{ auth.error }}
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="auth.loading">
          {{ auth.loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Não tem uma conta? <RouterLink to="/registro">Cadastre sua paróquia</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 4rem;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 3rem;
}

.auth-header { text-align: center; margin-bottom: 2.5rem; }
.auth-header h1 { margin-bottom: 0.5rem; }
.auth-header p { color: var(--text-muted); }

.btn-block { width: 100%; padding: 0.875rem; margin-top: 1rem; }

.error-msg {
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
  border: none;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.auth-footer a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}
</style>
