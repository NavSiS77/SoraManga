import { defineStore } from 'pinia'
import { AuthApi } from '../services/authApi'

const userKey = 'auth_user'

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(userKey) || 'null'),
    isLoading: false,
    error: ''
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => state.user?.role === 'ADMIN'
  },
  actions: {
    clearError() {
      this.error = ''
    },
    validateCredentials({ login, password, confirmPassword, isRegister = false }) {
      const normalizedLogin = String(login || '').trim()
      const normalizedPassword = String(password || '')
      if (!normalizedLogin || normalizedLogin.length < 3) {
        throw new Error('Логин должен содержать минимум 3 символа')
      }
      if (!/^[a-zA-Z0-9_]+$/.test(normalizedLogin)) {
        throw new Error('Логин может содержать только латинские буквы, цифры и _')
      }
      if (!normalizedPassword || normalizedPassword.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов')
      }
      if (isRegister && normalizedPassword !== String(confirmPassword || '')) {
        throw new Error('Пароли не совпадают')
      }
      return {
        login: normalizedLogin,
        password: normalizedPassword
      }
    },
    async login(payload) {
      this.clearError()
      this.isLoading = true
      try {
        const credentials = this.validateCredentials(payload)
        this.user = await AuthApi.login(credentials)
        localStorage.setItem(userKey, JSON.stringify(this.user))
      } catch (error) {
        this.error = error.message || 'Не удалось выполнить вход'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async register(payload) {
      this.clearError()
      this.isLoading = true
      try {
        const credentials = this.validateCredentials({ ...payload, isRegister: true })
        this.user = await AuthApi.register(credentials)
        localStorage.setItem(userKey, JSON.stringify(this.user))
      } catch (error) {
        this.error = error.message || 'Не удалось выполнить регистрацию'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    logout() {
      this.user = null
      this.clearError()
      localStorage.removeItem(userKey)
      localStorage.removeItem('auth_token')
    }
  }
})
