<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const pendentes = ref<any[]>([]);
const aprovadas = ref<any[]>([]);
const rejeitadas = ref<any[]>([]);
const loading = ref(true);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get('/admin/paroquias');
    pendentes.value = response.data.pendentes;
    aprovadas.value = response.data.aprovadas;
    rejeitadas.value = response.data.rejeitadas;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const aprovar = async (id: number) => {
  await api.patch(`/admin/paroquias/${id}/aprovar`);
  fetchData();
};

const rejeitar = async (id: number) => {
  if (confirm('Rejeitar esta paróquia?')) {
    await api.patch(`/admin/paroquias/${id}/rejeitar`);
    fetchData();
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="admin-page container fade-in">
    <header class="admin-header">
      <h1>Painel Administrativo</h1>
      <p>Gerencie as solicitações de cadastro do sistema.</p>
    </header>

    <div v-if="loading" class="loading">Carregando painel...</div>

    <div v-else class="admin-grid">
      <!-- Pedents Section -->
      <section class="admin-section">
        <div class="section-header">
          <h2>Paróquias Pendentes</h2>
          <span class="count">{{ pendentes.length }}</span>
        </div>

        <div v-if="pendentes.length === 0" class="empty card">
          Nenhuma solicitação aguardando.
        </div>

        <div v-else class="list">
          <div v-for="p in pendentes" :key="p.id" class="item card">
            <div class="info">
              <h3>{{ p.nome }}</h3>
              <p>Cadastrada em: {{ new Date(p.created_at).toLocaleDateString() }}</p>
            </div>
            <div class="actions">
              <button @click="rejeitar(p.id)" class="btn btn-danger btn-sm">Rejeitar</button>
              <button @click="aprovar(p.id)" class="btn btn-primary btn-sm">Aprovar</button>
            </div>
          </div>
        </div>
      </section>

      <!-- History Section -->
      <section class="admin-section">
        <div class="section-header">
          <h2>Histórico</h2>
          <span class="count">{{ aprovadas.length + rejeitadas.length }}</span>
        </div>

        <div class="list">
          <div v-for="p in aprovadas" :key="p.id" class="item card small">
            <div class="info">
              <h3>{{ p.nome }}</h3>
              <span class="badge badge-success">Aprovada</span>
            </div>
          </div>

          <div v-for="p in rejeitadas" :key="p.id" class="item card small">
            <div class="info">
              <h3>{{ p.nome }}</h3>
              <span class="badge badge-danger">Rejeitada</span>
            </div>
            <button @click="aprovar(p.id)" class="btn btn-outline btn-sm">Reconsiderar</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.admin-header { margin-bottom: 3rem; text-align: center; }
.admin-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; }

.section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.count { background: var(--primary); color: white; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.875rem; font-weight: 700; }

.list { display: flex; flex-direction: column; gap: 1rem; }
.item { display: flex; justify-content: space-between; align-items: center; }
.item.small { padding: 1rem 1.5rem; }
.item h3 { font-size: 1rem; margin-bottom: 0.25rem; }
.item p { font-size: 0.75rem; color: var(--text-muted); }

.actions { display: flex; gap: 0.75rem; }

.empty { text-align: center; padding: 2rem; color: var(--text-muted); border-style: dashed; }

@media (max-width: 992px) {
  .admin-grid { grid-template-columns: 1fr; }
}
</style>
