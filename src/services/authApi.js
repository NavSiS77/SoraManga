import apiClient from './apiClient'
import { DbService } from './db'

export const AuthApi = {
  async login(payload) {
    const user = DbService.login(payload)
    apiClient.setAuthToken(`token_${payload.login}`)
    return apiClient.post(user)
  },
  async register(payload) {
    const user = DbService.register(payload)
    apiClient.setAuthToken(`token_${payload.login}`)
    return apiClient.post(user)
  }
}
