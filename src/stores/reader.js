import { defineStore } from 'pinia'

const storageKey = 'reader_progress'

const loadRawProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

const isLegacyEntry = (value) => typeof value === 'number'

const isMangaEntry = (value) =>
  value && typeof value === 'object' && value.chapterId != null

/** Старый формат { chapterId: page } → { mangaId: { chapterId, page, updatedAt } } */
export function normalizeProgress(raw, mangaList = []) {
  const result = {}
  const legacy = []

  for (const [key, value] of Object.entries(raw || {})) {
    if (isMangaEntry(value)) {
      result[key] = {
        chapterId: Number(value.chapterId),
        page: Number(value.page) || 1,
        updatedAt: Number(value.updatedAt) || 0
      }
      continue
    }
    if (isLegacyEntry(value)) {
      legacy.push({ chapterId: Number(key), page: value })
    }
  }

  for (const { chapterId, page } of legacy) {
    if (!chapterId) {
      continue
    }
    for (const manga of mangaList) {
      const chapter = (manga.chapters || []).find((ch) => ch.id === chapterId)
      if (!chapter) {
        continue
      }
      const mangaKey = String(manga.id)
      const existing = result[mangaKey]
      if (!existing || chapterId >= existing.chapterId) {
        result[mangaKey] = {
          chapterId,
          page: Number(page) || 1,
          updatedAt: chapterId
        }
      }
      break
    }
  }

  return result
}

export const useReaderStore = defineStore('ReaderStore', {
  state: () => ({
    currentChapterId: null,
    currentMangaId: null,
    currentPage: 1,
    progress: loadRawProgress(),
    progressMigrated: false
  }),
  actions: {
    persistProgress() {
      localStorage.setItem(storageKey, JSON.stringify(this.progress))
    },

    ensureProgressMigrated(mangaList) {
      if (this.progressMigrated || !mangaList?.length) {
        return
      }
      const normalized = normalizeProgress(this.progress, mangaList)
      const changed = JSON.stringify(normalized) !== JSON.stringify(this.progress)
      this.progress = normalized
      this.progressMigrated = true
      if (changed) {
        this.persistProgress()
      }
    },

    loadChapter(chapterId, mangaId) {
      this.currentChapterId = chapterId
      this.currentMangaId = mangaId ?? null
      const saved = mangaId != null ? this.progress[String(mangaId)] : null
      if (saved && Number(saved.chapterId) === Number(chapterId)) {
        this.currentPage = Number(saved.page) || 1
      } else {
        this.currentPage = 1
      }
    },

    nextPage(maxPages) {
      if (this.currentPage < maxPages) {
        this.currentPage += 1
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1
      }
    },

    saveProgress(mangaId) {
      const resolvedMangaId = mangaId ?? this.currentMangaId
      if (!this.currentChapterId || resolvedMangaId == null) {
        return
      }
      this.progress[String(resolvedMangaId)] = {
        chapterId: Number(this.currentChapterId),
        page: Number(this.currentPage) || 1,
        updatedAt: Date.now()
      }
      this.persistProgress()
    },

    getProgressForManga(mangaId) {
      return this.progress[String(mangaId)] || null
    }
  }
})
