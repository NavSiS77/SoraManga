import { defineStore } from 'pinia'
import { MangaApi } from '../services/mangaApi'

export const useMangaStore = defineStore('MangaStore', {
  state: () => ({
    mangaList: [],
    isLoading: false,
    searchQuery: '',
    selectedGenre: null
  }),
  getters: {
    filteredManga(state) {
      return state.mangaList.filter((item) => {
        const byTitle = item.title.toLowerCase().includes(state.searchQuery.toLowerCase())
        const byGenre = state.selectedGenre ? item.genres.includes(state.selectedGenre) : true
        return byTitle && byGenre
      })
    }
  },
  actions: {
    async fetchCatalog() {
      this.isLoading = true
      this.mangaList = await MangaApi.getCatalog()
      this.isLoading = false
    },
    search(query) {
      this.searchQuery = query
    },
    applyGenreFilter(genreId) {
      this.selectedGenre = genreId
    }
  }
})
