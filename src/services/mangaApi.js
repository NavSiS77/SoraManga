import apiClient from './apiClient'
import { mangaList } from '../data/mockData'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const MangaApi = {
  async getCatalog() {
    await delay(200)
    return apiClient.get(mangaList)
  },
  async getById(id) {
    await delay(150)
    return apiClient.get(mangaList.find((item) => item.id === Number(id)) || null)
  }
}
