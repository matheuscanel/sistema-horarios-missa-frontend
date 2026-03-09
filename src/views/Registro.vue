<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const form = ref({
  nome_paroquia: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const handleRegister = async () => {
  const success = await auth.register(form.value);
  if (success) {
    router.push('/dashboard');
  }
};
</script>

<template>
  <div class="auth-page container fade-in">
    <div class="auth-card card">
      <div class="auth-header">
        <h1>Cadastrar Paróquia</h1>
        <p>Crie sua conta para gerenciar igrejas e horários.</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nome da Paróquia</label>
          <input v-model="form.nome_paroquia" type="text" placeholder="Ex: Paróquia Nossa Senhora da Boa Viagem" required />
        </div>

        <div class="form-group">
          <label>Seu Nome (Responsável)</label>
          <input v-model="form.name" type="text" placeholder="Nome completo" required />
        </div>

        <div class="form-group">
          <label>E-mail</label>
          <input v-model="form.email" type="email" placeholder="email@exemplo.com" required />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>

        <div class="form-group">
          <label>Confirmar Senha</label>
          <input v-model="form.password_confirmation" type="password" placeholder="Repita sua senha" required />
        </div>

        <div v-if="auth.error" class="error-msg card btn-danger">
          {{ auth.error }}
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="auth.loading">
          {{ auth.loading ? 'Cadastrando...' : 'Criar Conta' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Já tem uma conta? <RouterLink to="/login">Entre aqui</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page { display: flex; justify-content: center; padding: 2rem 0; }
.auth-card { width: 100%; max-width: 550px; padding: 2.5rem; }
.auth-header { text-align: center; margin-bottom: 2rem; }
.btn-block { width: 100%; padding: 0.875rem; margin-top: 1rem; }
.error-msg { padding: 0.75rem; margin-bottom: 1.5rem; font-size: 0.875rem; text-align: center; border: none; }
.auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--text-muted); }
.auth-footer a { color: var(--primary); font-weight: 600; text-decoration: none; }
</style>
