import apiClient from './apiClient'

export const AuthApi = {
  async login(payload) {
    const user = {
      id: 1,
      login: payload.login,
      role: payload.login === 'admin' ? 'ADMIN' : 'USER'
    }
    apiClient.setAuthToken(`token_${payload.login}`)
    return apiClient.post(user)
  },
  async register(payload) {
    const user = {
      id: Date.now(),
      login: payload.login,
      role: 'USER'
    }
    return apiClient.post(user)
  }
}
