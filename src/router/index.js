import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '../views/CatalogView.vue'

const routes = [
  { path: '/', name: 'catalog', component: CatalogView },
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
    component: () => import('../views/ProfileView.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
