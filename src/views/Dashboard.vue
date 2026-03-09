<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const paroquia = ref<any>(null);
const igrejas = ref<any[]>([]);
const loading = ref(true);

// Forms
const showIgrejaForm = ref(false);
const novaIgreja = ref({ nome: '', bairro: '', endereco: '' });

const showHorarioForm = ref<{igrejaId: number | null}>({ igrejaId: null });
const novoHorario = ref({ dia_semana: 'domingo', horario: '08:00' });

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get('/paroquia/dashboard');
    paroquia.value = response.data.paroquia;
    igrejas.value = response.data.igrejas;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const criarIgreja = async () => {
  try {
    await api.post('/paroquia/igrejas', novaIgreja.value);
    novaIgreja.value = { nome: '', bairro: '', endereco: '' };
    showIgrejaForm.value = false;
    fetchData();
  } catch (err) { alert('Erro ao criar igreja'); }
};

const deletarIgreja = async (id: number) => {
  if (confirm('Tem certeza? Isso apagará todos os horários desta igreja.')) {
    await api.delete(`/paroquia/igrejas/${id}`);
    fetchData();
  }
};

const adicionarHorario = async (igrejaId: number) => {
  try {
    await api.post(`/paroquia/igrejas/${igrejaId}/horarios`, novoHorario.value);
    showHorarioForm.value.igrejaId = null;
    fetchData();
  } catch (err) { alert('Erro ao adicionar horário'); }
};

const deletarHorario = async (id: number) => {
  await api.delete(`/paroquia/horarios/${id}`);
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <div class="dashboard container fade-in">
    <div v-if="loading" class="loading">Carregando...</div>
    
    <div v-else>
      <header class="dash-header">
        <div>
          <h1>{{ paroquia?.nome }}</h1>
          <span :class="['badge', `badge-${paroquia?.status}`]">
            Status: {{ paroquia?.status }}
          </span>
        </div>
        <button @click="showIgrejaForm = !showIgrejaForm" class="btn btn-primary">
          + Nova Igreja
        </button>
      </header>

      <div v-if="paroquia?.status === 'pendente'" class="alert warning shadow">
        <span class="icon">⏳</span>
        <div class="content">
          <strong>Cadastro Pendente</strong>
          <p>Sua paróquia está aguardando aprovação administrativa. Seus horários ainda não aparecem na busca pública.</p>
        </div>
      </div>

      <!-- Add Igreja Form -->
      <transition name="slide">
        <div v-if="showIgrejaForm" class="card form-card mb-4">
          <h3>Cadastrar Nova Igreja</h3>
          <form @submit.prevent="criarIgreja" class="grid-form">
            <div class="form-group">
              <label>Nome</label>
              <input v-model="novaIgreja.nome" placeholder="Ex: Capela de São José" required />
            </div>
            <div class="form-group">
              <label>Bairro</label>
              <input v-model="novaIgreja.bairro" placeholder="Ex: Centro" required />
            </div>
            <div class="form-group full-width">
              <label>Endereço Completo</label>
              <input v-model="novaIgreja.endereco" placeholder="Rua..." required />
            </div>
            <div class="actions">
              <button type="button" @click="showIgrejaForm = false" class="btn btn-outline">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Igreja</button>
            </div>
          </form>
        </div>
      </transition>

      <!-- list of igrejass -->
      <div v-if="igrejas.length === 0" class="empty-dash card">
        <p>Você ainda não cadastrou nenhuma igreja.</p>
      </div>

      <div class="igrejas-list">
        <div v-for="igreja in igrejas" :key="igreja.id" class="igreja-item card">
          <div class="igreja-info">
            <h2>{{ igreja.nome }}</h2>
            <p>{{ igreja.endereco }} - {{ igreja.bairro }}</p>
            <button @click="deletarIgreja(igreja.id)" class="btn btn-danger btn-sm mt-2">Remover Igreja</button>
          </div>

          <div class="horarios-manager">
            <div class="h-header">
              <h3>Horários de Missa</h3>
              <button @click="showHorarioForm.igrejaId = igreja.id" class="btn btn-outline btn-sm">+ Adicionar</button>
            </div>

            <!-- Add Horario Form Inline -->
            <div v-if="showHorarioForm.igrejaId === igreja.id" class="horario-inline-form">
                <select v-model="novoHorario.dia_semana">
                    <option v-for="d in ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado']" :key="d" :value="d">{{d}}</option>
                </select>
                <input v-model="novoHorario.horario" type="time" />
                <button @click="adicionarHorario(igreja.id)" class="btn btn-primary btn-sm">OK</button>
                <button @click="showHorarioForm.igrejaId = null" class="btn btn-outline btn-sm">X</button>
            </div>

            <div class="horarios-grid">
              <div v-for="h in igreja.horario_missas" :key="h.id" class="h-chip">
                <span><strong>{{ h.dia_semana.substring(0,3) }}</strong> {{ h.horario.substring(0,5) }}</span>
                <button @click="deletarHorario(h.id)" class="delete-h">×</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.dash-header h1 { margin-bottom: 0.5rem; }

.alert { 
  display: flex; gap: 1rem; padding: 1.5rem; border-radius: var(--radius); margin-bottom: 2rem; 
  background: #fff8eb; border-left: 4px solid var(--warning);
}
.alert .icon { font-size: 1.5rem; }
.alert strong { display: block; margin-bottom: 0.25rem; }
.alert p { font-size: 0.875rem; color: #92400e; }

.form-card { background: #f1f5f9; border-style: dashed; }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.full-width { grid-column: span 2; }
.actions { grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; }

.igrejas-list { display: flex; flex-direction: column; gap: 1.5rem; }
.igreja-item { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }

.h-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.horarios-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.h-chip {
  background: var(--background);
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.delete-h {
  border: none; background: none; color: var(--danger); font-size: 1.25rem; cursor: pointer;
  line-height: 1; padding: 0 0.25rem;
}

.horario-inline-form {
    display: flex; gap: 0.5rem; margin-bottom: 1rem; background: white; padding: 0.5rem; border-radius: 8px;
    box-shadow: var(--shadow);
}

.mb-4 { margin-bottom: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }

@media (max-width: 768px) {
  .igreja-item { grid-template-columns: 1fr; }
}
</style>
