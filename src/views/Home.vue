<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const igrejas = ref<any[]>([]);
const bairros = ref<string[]>([]);
const loading = ref(true);
const busca = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const filters = ref({
  bairro: '',
  dia_semana: ''
});

const diasSemana = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 
  'quinta-feira', 'sexta-feira', 'sábado'
];

const fetchIgrejas = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (busca.value.trim()) params.set('busca', busca.value.trim());
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

const onBuscaInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchIgrejas();
  }, 400);
};

onMounted(fetchIgrejas);

</script>

<template>
  <div class="home-page fade-in">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-content">
        <h1>Encontre horários de missas em Pernambuco</h1>
        <p>Busque por nome, paróquia, bairro ou dia da semana.</p>
        
        <div class="search-box card">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              v-model="busca" 
              @input="onBuscaInput" 
              type="text" 
              placeholder="Buscar igreja, paróquia ou bairro..." 
              class="search-input"
            />
          </div>
          
          <div class="filters-row">
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
          <p v-if="igreja.paroquia" class="meta-item paroquia-info"><span class="meta-label">Paróquia:</span> {{ igreja.paroquia.nome }}</p>
          
          <div class="horarios-section">
            <h4>Horários de Missa</h4>
            <div class="horarios-list">
              <div v-for="h in igreja.horario_missas" :key="h.id" class="horario-item">
                <span class="dia">{{ h.dia_semana.substring(0, 3) }}</span>
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
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  padding: 2rem;
  max-width: 900px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 2.75rem;
  font-size: 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: var(--bg);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.search-input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.filters-row {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}

.filter-group { flex: 1; }
.filter-group label { color: var(--text-main); }



.igrejas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 1rem;
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

.endereco { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem; }

.meta-item {
  font-size: 0.8rem;
  margin: 0;
}

.meta-label {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 0.7rem;
}

.paroquia-info {
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

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
  background: linear-gradient(135deg, var(--primary), #818cf8);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
  width: 70px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.horario-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.horario-item .dia { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.85; }
.horario-item .hora { font-size: 1.1rem; font-weight: 800; }

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
