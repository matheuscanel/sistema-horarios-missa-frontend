<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const igrejas = ref<any[]>([]);
const bairros = ref<string[]>([]);
const loading = ref(true);
const filters = ref({
  bairro: '',
  dia_semana: ''
});

const diasSemana = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 
  'quinta-feira', 'sexta-feira', 'sábado'
];

const fetchIgrejas = async () => {
  loading.ref = true;
  try {
    const params = new URLSearchParams();
    if (filters.value.bairro) params.set('bairro', filters.value.bairro);
    if (filters.value.dia_semana) params.set('dia_semana', filters.value.dia_semana);

    const response = await api.get(`/igrejas?${params.toString()}`);
    igrejas.value = response.data.igrejas;
    if (response.data.bairros) {
        bairros.value = response.data.bairros;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchIgrejas);
</script>

<template>
  <div class="home-page fade-in">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-content">
        <h1>Encontre horários de missas em Pernambuco</h1>
        <p>Busque por bairro ou dia da semana e planeje sua ida à paróquia.</p>
        
        <div class="search-box card">
          <div class="filter-group">
            <label>Bairro</label>
            <select v-model="filters.bairro" @change="fetchIgrejas">
              <option value="">Todos os bairros</option>
              <option v-for="b in bairros" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Dia da Semana</label>
            <select v-model="filters.dia_semana" @change="fetchIgrejas">
              <option value="">Todos os dias</option>
              <option v-for="d in diasSemana" :key="d" :value="d">{{ d.charAt(0).toUpperCase() + d.slice(1) }}</option>
            </select>
          </div>
          
          <button @click="fetchIgrejas" class="btn btn-primary">
            Buscar
          </button>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando igrejas...</p>
      </div>

      <div v-else-if="igrejas.length === 0" class="empty-state card">
        <h3>Nenhuma igreja encontrada</h3>
        <p>Tente ajustar os filtros ou busque em outro bairro.</p>
      </div>

      <div v-else class="igrejas-grid">
        <div v-for="igreja in igrejas" :key="igreja.id" class="igreja-card card">
          <div class="igreja-header">
            <h3>{{ igreja.nome }}</h3>
            <span class="badge badge-success">{{ igreja.bairro }}</span>
          </div>
          <p class="endereco">📍 {{ igreja.endereco }}</p>
          <p class="paroquia-name">Paróquia: {{ igreja.paroquia.nome }}</p>
          
          <div class="horarios-section">
            <h4>Próximas Missas</h4>
            <div class="horarios-list">
              <div v-for="h in igreja.horario_missas" :key="h.id" class="horario-item">
                <span class="dia">{{ h.dia_semana }}</span>
                <span class="hora">{{ h.horario.substring(0, 5) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)),
              url('/church_header_background.png') center/cover no-repeat;
  padding: 6rem 0;
  color: white;
  margin-top: -2rem;
  margin-bottom: 2rem;
}

.hero h1 { color: white; margin-bottom: 1rem; }
.hero p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 3rem; max-width: 600px; }

.search-box {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  background: white;
  padding: 2rem;
  max-width: 900px;
}

.filter-group { flex: 1; }
.filter-group label { color: var(--text-main); }

.igrejas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.igreja-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.igreja-card:hover { transform: translateY(-4px); }

.igreja-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.endereco { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.25rem; }
.paroquia-name { font-weight: 600; font-size: 0.75rem; color: var(--primary); margin-bottom: 1.5rem; }

.horarios-section h4 {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.horarios-list { display: flex; flex-wrap: wrap; gap: 0.75rem; }

.horario-item {
  background: var(--background);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.horario-item .dia { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
.horario-item .hora { font-size: 1rem; font-weight: 800; color: var(--text-main); }

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
