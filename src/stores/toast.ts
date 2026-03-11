import { defineStore } from 'pinia';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration: number;
}

let nextId = 0;

export const useToastStore = defineStore('toast', {
    state: () => ({
        toasts: [] as Toast[],
    }),

    actions: {
        add(message: string, type: ToastType = 'info', duration: number = 4000) {
            const id = nextId++;
            this.toasts.push({ id, message, type, duration });

            setTimeout(() => {
                this.remove(id);
            }, duration);
        },

        remove(id: number) {
            this.toasts = this.toasts.filter(t => t.id !== id);
        },

        success(message: string) {
            this.add(message, 'success');
        },

        error(message: string) {
            this.add(message, 'error', 5000);
        },

        warning(message: string) {
            this.add(message, 'warning');
        },

        info(message: string) {
            this.add(message, 'info');
        },
    },
});
