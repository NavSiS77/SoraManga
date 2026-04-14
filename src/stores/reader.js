import { defineStore } from 'pinia'

const storageKey = 'reader_progress'

export const useReaderStore = defineStore('ReaderStore', {
  state: () => ({
    currentChapterId: null,
    currentPage: 1,
    progress: JSON.parse(localStorage.getItem(storageKey) || '{}')
  }),
  actions: {
    loadChapter(chapterId) {
      this.currentChapterId = chapterId
      this.currentPage = this.progress[chapterId] || 1
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
    saveProgress() {
      if (!this.currentChapterId) {
        return
      }
      this.progress[this.currentChapterId] = this.currentPage
      localStorage.setItem(storageKey, JSON.stringify(this.progress))
    }
  }
})
