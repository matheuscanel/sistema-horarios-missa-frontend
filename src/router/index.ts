import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/Registro.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true, role: 'paroquia' }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    }
  ]
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login' })
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    if (auth.isAdmin) return next({ name: 'admin' })
    return next({ name: 'dashboard' })
  }

  if (to.meta.role && auth.user?.tipo !== to.meta.role) {
    return next({ name: 'home' })
  }

  next()
})

export default router
