import { defineStore } from 'pinia'
import { buildInitialBuckets, bucketsMean } from '../utils/mangaRatingBuckets'

const storageKey = 'manga_user_ratings_v1'

const loadRaw = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

const saveRaw = (raw) => {
  localStorage.setItem(storageKey, JSON.stringify(raw))
}

export const useMangaUserRatingsStore = defineStore('MangaUserRatings', {
  state: () => ({
    /** @type {Record<number, { counts: number[], userStars: number|null }>} */
    byManga: loadRaw()
  }),
  actions: {
    ensureManga(mangaId, shikiMean) {
      if (this.byManga[mangaId]?.counts?.length === 10) {
        return
      }
      const counts = buildInitialBuckets(shikiMean)
      this.byManga = {
        ...this.byManga,
        [mangaId]: {
          counts,
          userStars: this.byManga[mangaId]?.userStars ?? null
        }
      }
      saveRaw(this.byManga)
    },
    setUserVote(mangaId, stars, shikiMean) {
      this.ensureManga(mangaId, shikiMean)
      const entry = this.byManga[mangaId]
      const counts = [...entry.counts]
      const prev = entry.userStars
      if (prev === stars) {
        counts[stars - 1] = Math.max(0, counts[stars - 1] - 1)
        this.byManga = {
          ...this.byManga,
          [mangaId]: { counts, userStars: null }
        }
        saveRaw(this.byManga)
        return
      }
      if (prev != null && prev >= 1 && prev <= 10) {
        counts[prev - 1] = Math.max(0, counts[prev - 1] - 1)
      }
      if (stars >= 1 && stars <= 10) {
        counts[stars - 1] += 1
      }
      this.byManga = {
        ...this.byManga,
        [mangaId]: { counts, userStars: stars }
      }
      saveRaw(this.byManga)
    }
  },
  getters: {
    getSummary() {
      return (mangaId, shikiMean) => {
        const entry = this.byManga[mangaId]
        const counts =
          entry?.counts?.length === 10 ? [...entry.counts] : buildInitialBuckets(shikiMean)
        const total = counts.reduce((a, b) => a + b, 0)
        const mean = bucketsMean(counts)
        const rows = []
        for (let star = 10; star >= 1; star--) {
          const c = counts[star - 1]
          const pct = total ? (c / total) * 100 : 0
          rows.push({ star, count: c, pct })
        }
        return {
          counts,
          total,
          mean,
          rows,
          userStars: entry?.userStars ?? null
        }
      }
    }
  }
})
