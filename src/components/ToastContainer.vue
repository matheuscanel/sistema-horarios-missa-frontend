<script setup lang="ts">
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toast.toasts"
          :key="t.id"
          :class="['toast-item', `toast-${t.type}`]"
          @click="toast.remove(t.id)"
        >
          <span class="toast-icon">
            <template v-if="t.type === 'success'">✓</template>
            <template v-else-if="t.type === 'error'">✕</template>
            <template v-else-if="t.type === 'warning'">⚠</template>
            <template v-else>ℹ</template>
          </span>
          <span class="toast-message">{{ t.message }}</span>
          <button class="toast-close" @click.stop="toast.remove(t.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 420px;
  width: 100%;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  pointer-events: all;
  backdrop-filter: blur(8px);
  line-height: 1.4;
}

.toast-icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.25);
}

.toast-message {
  flex: 1;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
}

.toast-close:hover {
  color: white;
}

/* Types */
.toast-success {
  background: linear-gradient(135deg, #16a34a, #22c55e);
}

.toast-error {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

.toast-warning {
  background: linear-gradient(135deg, #d97706, #f59e0b);
}

.toast-info {
  background: linear-gradient(135deg, #6366f1, #818cf8);
}

/* Animations */
.toast-enter-active {
  animation: toast-in 0.35s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.25s ease-in forwards;
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

@media (max-width: 480px) {
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>
