import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.tipo === 'admin',
        isParoquia: (state) => state.user?.tipo === 'paroquia',
    },

    actions: {
        async login(credentials: any) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.post('/login', credentials);
                this.token = response.data.token;
                this.user = response.data.user;

                localStorage.setItem('token', this.token!);
                localStorage.setItem('user', JSON.stringify(this.user));

                return true;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Erro ao fazer login';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async register(data: any) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.post('/registro', data);
                this.token = response.data.token;
                this.user = response.data.user;

                localStorage.setItem('token', this.token!);
                localStorage.setItem('user', JSON.stringify(this.user));

                return true;
            } catch (err: any) {
                const data = err.response?.data;
                if (data?.errors) {
                    const errors: Record<string, string[]> = data.errors;
                    const firstKey = Object.keys(errors)[0];
                    this.error = (firstKey && errors[firstKey] ? errors[firstKey][0] : 'Erro ao cadastrar') ?? null;
                } else {
                    this.error = data?.message || 'Erro ao cadastrar';
                }
                return false;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                await api.post('/logout');
            } catch (err) {
                console.error('Logout error:', err);
            } finally {
                this.token = null;
                this.user = null;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }
});
