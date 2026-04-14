import { defineStore } from 'pinia'
import { AuthApi } from '../services/authApi'

const userKey = 'auth_user'

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(userKey) || 'null'),
    isLoading: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user)
  },
  actions: {
    async login(payload) {
      this.isLoading = true
      this.user = await AuthApi.login(payload)
      localStorage.setItem(userKey, JSON.stringify(this.user))
      this.isLoading = false
    },
    async register(payload) {
      this.isLoading = true
      this.user = await AuthApi.register(payload)
      localStorage.setItem(userKey, JSON.stringify(this.user))
      this.isLoading = false
    },
    logout() {
      this.user = null
      localStorage.removeItem(userKey)
      localStorage.removeItem('auth_token')
    }
  }
})
