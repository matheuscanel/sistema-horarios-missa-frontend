<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const auth = useAuthStore();
const toast = useToastStore();
const paroquia = ref<any>(null);
const igrejas = ref<any[]>([]);
const loading = ref(true);

// Forms
const showIgrejaForm = ref(false);
const novaIgreja = ref({ nome: '', bairro: '', endereco: '' });

const showHorarioForm = ref<{igrejaId: number | null}>({ igrejaId: null });
const novoHorario = ref({ dia_semana: 'domingo', horario: '08:00' });

const horas = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutos = ['00', '15', '30', '45'];
const horaSelecionada = ref('08');
const minutoSelecionado = ref('00');

const openHourDropdown = ref(false);
const openMinDropdown = ref(false);

const selectHora = (h: string) => {
  horaSelecionada.value = h;
  openHourDropdown.value = false;
};

const selectMinuto = (m: string) => {
  minutoSelecionado.value = m;
  openMinDropdown.value = false;
};

watch([horaSelecionada, minutoSelecionado], () => {
  novoHorario.value.horario = `${horaSelecionada.value}:${minutoSelecionado.value}`;
}, { immediate: true });

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
    toast.success('Igreja cadastrada com sucesso!');
    fetchData();
  } catch (err) { toast.error('Erro ao criar igreja. Verifique os dados e tente novamente.'); }
};

const deletarIgreja = async (id: number) => {
  if (confirm('Tem certeza? Isso apagará todos os horários desta igreja.')) {
    await api.delete(`/paroquia/igrejas/${id}`);
    toast.success('Igreja removida com sucesso.');
    fetchData();
  }
};

const adicionarHorario = async (igrejaId: number) => {
  // Validação no Frontend: verifica se já existe na lista local
  const igreja = igrejas.value.find(i => i.id === igrejaId);
  if (igreja) {
    const duplicado = igreja.horario_missas.some((h: any) => 
      h.dia_semana === novoHorario.value.dia_semana && 
      h.horario.substring(0, 5) === novoHorario.value.horario
    );

    if (duplicado) {
      toast.error('Este horário já está cadastrado para esta igreja.');
      return;
    }
  }

  try {
    await api.post(`/paroquia/igrejas/${igrejaId}/horarios`, novoHorario.value);
    showHorarioForm.value.igrejaId = null;
    toast.success('Horário adicionado!');
    fetchData();
  } catch (err: any) { 
    const message = err.response?.data?.message || 'Erro ao adicionar horário.';
    toast.error(message); 
  }
};

const deletarHorario = async (id: number) => {
  await api.delete(`/paroquia/horarios/${id}`);
  toast.info('Horário removido.');
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
              <button @click="showHorarioForm.igrejaId = igreja.id" class="btn btn-primary btn-sm">+ Adicionar Horário</button>
            </div>

            <!-- Add Horario Form Inline -->
            <div v-if="showHorarioForm.igrejaId === igreja.id" class="horario-inline-form">
                <select v-model="novoHorario.dia_semana" class="select-dia">
                    <option v-for="d in ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado']" :key="d" :value="d">{{d}}</option>
                </select>
                
                <div class="time-picker-custom">
                  <div class="custom-dropdown">
                    <button type="button" class="dropdown-trigger" @click="openHourDropdown = !openHourDropdown; openMinDropdown = false">
                      {{ horaSelecionada }}h
                    </button>
                    <div v-if="openHourDropdown" class="dropdown-menu">
                      <div v-for="h in horas" :key="h" class="dropdown-item" :class="{active: h === horaSelecionada}" @click="selectHora(h)">
                        {{ h }}h
                      </div>
                    </div>
                  </div>

                  <span>:</span>

                  <div class="custom-dropdown">
                    <button type="button" class="dropdown-trigger" @click="openMinDropdown = !openMinDropdown; openHourDropdown = false">
                      {{ minutoSelecionado }}
                    </button>
                    <div v-if="openMinDropdown" class="dropdown-menu">
                      <div v-for="m in minutos" :key="m" class="dropdown-item" :class="{active: m === minutoSelecionado}" @click="selectMinuto(m)">
                        {{ m }}
                      </div>
                    </div>
                  </div>
                </div>

                <button @click="adicionarHorario(igreja.id)" class="btn btn-primary btn-sm">OK</button>
                <button @click="showHorarioForm.igrejaId = null" class="btn btn-outline btn-sm">X</button>
            </div>

            <div class="horarios-grid">
              <div v-for="h in igreja.horario_missas" :key="h.id" class="h-chip">
                <button @click="deletarHorario(h.id)" class="delete-h">×</button>
                <span class="h-dia">{{ h.dia_semana.substring(0,3) }}</span>
                <span class="h-hora">{{ h.horario.substring(0,5) }}</span>
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
  background: linear-gradient(135deg, var(--primary), #818cf8);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.h-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.h-dia {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

.h-hora {
  font-size: 1.1rem;
  font-weight: 800;
}

.delete-h {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: var(--danger);
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  line-height: 1;
}

.h-chip:hover .delete-h {
  opacity: 1;
}

.horario-inline-form {
    display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;
    margin-bottom: 1rem; background: #f8fafc; padding: 0.75rem; border-radius: 12px;
    border: 1px solid var(--border);
}

.select-dia { flex: 1; min-width: 120px; }

.time-picker-custom {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.custom-dropdown {
    position: relative;
}

.dropdown-trigger {
    background: white;
    border: 1px solid var(--border);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    min-width: 60px;
    font-family: inherit;
    color: var(--text-main);
}

.dropdown-trigger:hover {
    background: var(--background);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    min-width: 70px;
}

.dropdown-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.1s;
    text-align: center;
}

.dropdown-item:hover {
    background: #f1f5f9;
}

.dropdown-item.active {
    background: var(--primary);
    color: white;
}

.mb-4 { margin-bottom: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }

@media (max-width: 768px) {
  .igreja-item { grid-template-columns: 1fr; }
}
</style>
