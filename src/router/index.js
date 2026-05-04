import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '../views/CatalogView.vue'

const routes = [
  { path: '/', name: 'catalog', component: CatalogView },
  {
    path: '/catalog',
    name: 'catalog-all',
    component: () => import('../views/AllCatalogView.vue')
  },
  {
    path: '/manga/:id',
    name: 'manga-detail',
    component: () => import('../views/MangaDetailView.vue')
  },
  {
    path: '/reader/:mangaId/:chapterId',
    name: 'reader',
    component: () => import('../views/ReaderView.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/AuthView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const rawUser = localStorage.getItem('auth_user')
  let user = null
  try {
    user = rawUser ? JSON.parse(rawUser) : null
  } catch (error) {
    user = null
  }

  if (to.meta.requiresAuth && !user) {
    return {
      path: '/auth',
      query: { redirect: to.fullPath }
    }
  }

  if (to.meta.requiresAdmin && user?.role !== 'ADMIN') {
    return { path: '/profile' }
  }

  if (to.path === '/auth' && user) {
    return { path: '/profile' }
  }

  return true
})

export default router
