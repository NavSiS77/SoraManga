import { defineStore } from 'pinia'
import { MangaApi } from '../services/mangaApi'
import { getShikimoriPopularityRank } from '../data/shikimoriScores'

const favoritesKey = 'favorite_ids'
const plannedKey = 'planned_ids'

export const useMangaStore = defineStore('MangaStore', {
  state: () => ({
    mangaList: [],
    genres: [],
    isLoading: false,
    searchQuery: '',
    selectedGenre: null,
    sortBy: 'popular',
    favorites: JSON.parse(localStorage.getItem(favoritesKey) || '[]'),
    planned: JSON.parse(localStorage.getItem(plannedKey) || '[]')
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
      return sorted.sort((a, b) => {
        const ra = a.popularityRank ?? getShikimoriPopularityRank(a.id)
        const rb = b.popularityRank ?? getShikimoriPopularityRank(b.id)
        if (ra !== rb) {
          return ra - rb
        }
        return (b.rating || 0) - (a.rating || 0)
      })
    },
    favoriteManga(state) {
      return state.mangaList.filter((item) => state.favorites.includes(item.id))
    },
    isFavorite: (state) => (mangaId) => {
      return state.favorites.includes(mangaId)
    },
    isPlanned: (state) => (mangaId) => {
      return state.planned.includes(mangaId)
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
    },
    togglePlanned(mangaId) {
      if (this.planned.includes(mangaId)) {
        this.planned = this.planned.filter((id) => id !== mangaId)
      } else {
        this.planned = [...this.planned, mangaId]
      }
      localStorage.setItem(plannedKey, JSON.stringify(this.planned))
    }
  }
})
