<template>
  <section v-if="chapter && page" class="reader">
    <header class="reader-toolbar">
      <div class="reader-toolbar-info">
        <h1 class="reader-title">{{ manga.title }} — Глава {{ chapter.number }}</h1>
        <p class="reader-page-info">Страница {{ readerStore.currentPage }} / {{ chapter.pages.length }}</p>
      </div>
      <div class="reader-toolbar-actions">
        <button type="button" class="tool-btn" @click="toggleFullscreen">
          {{ isFullscreen ? 'Свернуть' : 'На весь экран' }}
        </button>
        <button type="button" class="tool-btn tool-btn-close" @click="closeManga">
          Закрыть мангу
        </button>
      </div>
    </header>

    <div ref="readerViewport" class="reader-viewport">
      <button
        v-if="isFullscreen"
        type="button"
        class="fs-exit"
        @click="toggleFullscreen"
      >
        Свернуть
      </button>
      <div class="reader-wrap">
      <div class="reader-stage">
        <button
          type="button"
          class="edge edge-left"
          aria-label="Предыдущая страница"
          :disabled="readerStore.currentPage <= 1"
          @click="prevPage"
        />
        <img
          class="reader-page"
          :src="page.imageUrl"
          :alt="`Страница ${page.number}`"
          loading="eager"
          decoding="async"
        >
        <button
          type="button"
          class="edge edge-right"
          aria-label="Следующая страница"
          :disabled="readerStore.currentPage >= chapter.pages.length"
          @click="nextPage"
        />
      </div>
    </div>
    </div>
  </section>
  <p v-else class="not-found">Глава не найдена.</p>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMangaStore } from '../stores/manga'
import { useReaderStore } from '../stores/reader'
import { MangaApi } from '../services/mangaApi'

export default {
  name: 'ReaderView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const mangaStore = useMangaStore()
    const readerStore = useReaderStore()
    const readerViewport = ref(null)
    const isFullscreen = ref(false)

    const manga = computed(() =>
      mangaStore.mangaList.find((item) => item.id === Number(route.params.mangaId))
    )
    const chapter = computed(() =>
      manga.value?.chapters.find((item) => item.id === Number(route.params.chapterId))
    )
    const page = computed(() => chapter.value?.pages[readerStore.currentPage - 1])

    const nextPage = () => {
      readerStore.nextPage(chapter.value.pages.length)
      readerStore.saveProgress()
    }
    const prevPage = () => {
      readerStore.prevPage()
      readerStore.saveProgress()
    }

    const syncFullscreenState = () => {
      isFullscreen.value = document.fullscreenElement === readerViewport.value
    }

    const exitFullscreenIfNeeded = async () => {
      const el = readerViewport.value
      if (!el || document.fullscreenElement !== el) {
        return
      }
      try {
        await document.exitFullscreen()
      } catch {
        /* документ уже не в fullscreen при уходе со страницы */
      }
    }

    const toggleFullscreen = async () => {
      const el = readerViewport.value
      if (!el) {
        return
      }
      try {
        if (document.fullscreenElement === el) {
          await document.exitFullscreen()
        } else if (!document.fullscreenElement) {
          await el.requestFullscreen()
        }
      } catch {
        /* браузер мог отклонить полноэкранный режим */
      }
      syncFullscreenState()
    }

    const closeManga = async () => {
      await exitFullscreenIfNeeded()
      syncFullscreenState()
      if (manga.value?.id) {
        await router.push(`/manga/${manga.value.id}`)
      }
    }

    onMounted(() => {
      if (!mangaStore.mangaList.length) {
        mangaStore.fetchCatalog()
      }
      MangaApi.getById(route.params.mangaId).then((item) => {
        if (item && !mangaStore.mangaList.find((mangaItem) => mangaItem.id === item.id)) {
          mangaStore.mangaList = [...mangaStore.mangaList, item]
        }
      })
      readerStore.loadChapter(Number(route.params.chapterId))
      document.addEventListener('fullscreenchange', syncFullscreenState)
    })

    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
      exitFullscreenIfNeeded()
      readerStore.saveProgress()
    })

    return {
      manga,
      chapter,
      page,
      readerStore,
      isFullscreen,
      nextPage,
      prevPage,
      toggleFullscreen,
      closeManga
    }
  }
}
</script>

<style scoped>
.reader {
  min-width: 0;
}

.reader-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #efbfd3;
}

.reader-toolbar-info {
  min-width: 0;
}

.reader-title {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  line-height: 1.25;
  color: #831843;
  font-weight: 800;
}

.reader-page-info {
  margin: 4px 0 0;
  font-size: 14px;
  color: #7f3652;
}

.reader-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #efbfd3;
  background: #fff8fc;
  color: #a73667;
  cursor: pointer;
  text-decoration: none;
  line-height: 1.2;
}

.tool-btn:hover {
  border-color: #e291b0;
  background: #fff;
}

.tool-btn-close {
  background: linear-gradient(135deg, #ff82b4, #ec4899);
  color: #fff;
  border-color: #db2777;
}

.tool-btn-close:hover {
  filter: brightness(1.04);
  border-color: #be185d;
}

.reader-viewport {
  position: relative;
  min-height: 200px;
}

.reader-viewport:fullscreen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #121016;
  box-sizing: border-box;
}

.fs-exit {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  background: rgba(20, 16, 24, 0.75);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.fs-exit:hover {
  background: rgba(40, 32, 48, 0.9);
}

.reader-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 0;
}

.reader-viewport:fullscreen .reader-wrap {
  align-items: center;
  height: 100%;
}

.reader-stage {
  position: relative;
  width: 100%;
  max-width: min(100%, 900px);
  line-height: 0;
}

.reader-viewport:fullscreen .reader-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  height: 100%;
}

.reader-page {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  user-select: none;
  -webkit-user-drag: none;
}

.reader-viewport:fullscreen .reader-page {
  max-width: 100vw;
  max-height: 100vh;
  width: auto;
  height: auto;
  margin: 0 auto;
  object-fit: contain;
  border-radius: 0;
  box-shadow: none;
}

.edge {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 30%;
  z-index: 2;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.edge-left {
  left: 0;
}

.edge-right {
  right: 0;
}

.edge:hover:not(:disabled) {
  background: linear-gradient(90deg, rgba(194, 24, 91, 0.08) 0%, transparent 70%);
}

.edge-right:hover:not(:disabled) {
  background: linear-gradient(270deg, rgba(194, 24, 91, 0.08) 0%, transparent 70%);
}

.edge:disabled {
  cursor: default;
}

.not-found {
  color: #74495b;
}

@media (max-width: 520px) {
  .reader-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .reader-toolbar-actions {
    width: 100%;
  }

  .tool-btn {
    flex: 1 1 auto;
  }
}
</style>
