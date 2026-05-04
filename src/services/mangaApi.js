import apiClient from './apiClient'
import { DbService } from './db'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const MangaApi = {
  async getCatalog(filters = {}) {
    await delay(200)
    return apiClient.get(DbService.getCatalog(filters))
  },
  async getById(id) {
    await delay(150)
    return apiClient.get(DbService.getById(id))
  },
  async getGenres() {
    return apiClient.get(DbService.getGenres())
  },
  async addManga(payload) {
    return apiClient.post(DbService.addManga(payload))
  },
  async addChapter(mangaId, payload) {
    return apiClient.post(DbService.addChapter(mangaId, payload))
  }
}
