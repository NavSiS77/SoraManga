import { defineStore } from 'pinia'
import { MangaApi } from '../services/mangaApi'

const favoritesKey = 'favorite_ids'

export const useMangaStore = defineStore('MangaStore', {
  state: () => ({
    mangaList: [],
    genres: [],
    isLoading: false,
    searchQuery: '',
    selectedGenre: null,
    sortBy: 'popular',
    favorites: JSON.parse(localStorage.getItem(favoritesKey) || '[]')
  }),
  getters: {
    topRated30(state) {
      return [...state.mangaList]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 30)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))
    },
    sortedManga(state) {
      const sorted = [...state.mangaList]
      if (state.sortBy === 'title-asc') {
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      }
      if (state.sortBy === 'title-desc') {
        return sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'))
      }
      if (state.sortBy === 'newest') {
        return sorted.sort((a, b) => b.id - a.id)
      }
      if (state.sortBy === 'rating') {
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      }
      return sorted.sort((a, b) => b.views - a.views)
    },
    favoriteManga(state) {
      return state.mangaList.filter((item) => state.favorites.includes(item.id))
    },
    isFavorite: (state) => (mangaId) => {
      return state.favorites.includes(mangaId)
    }
  },
  actions: {
    async fetchCatalog() {
      this.isLoading = true
      this.mangaList = await MangaApi.getCatalog({
        searchQuery: this.searchQuery,
        genreId: this.selectedGenre
      })
      this.isLoading = false
    },
    async fetchGenres() {
      this.genres = await MangaApi.getGenres()
    },
    search(query) {
      this.searchQuery = query
      this.fetchCatalog()
    },
    applyGenreFilter(genreId) {
      this.selectedGenre = genreId ? Number(genreId) : null
      this.fetchCatalog()
    },
    applySorting(sortBy) {
      this.sortBy = sortBy || 'popular'
    },
    toggleFavorite(mangaId) {
      if (this.favorites.includes(mangaId)) {
        this.favorites = this.favorites.filter((id) => id !== mangaId)
      } else {
        this.favorites = [...this.favorites, mangaId]
      }
      localStorage.setItem(favoritesKey, JSON.stringify(this.favorites))
    }
  }
})
