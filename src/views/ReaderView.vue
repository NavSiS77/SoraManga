<template>
  <AdultContentGate
    v-if="manga && !readAccess.allowed"
    :message="readAccess.reason"
    :manga-title="manga.title"
  />
  <section
    v-else-if="chapter && page"
    ref="readerRoot"
    class="reader"
    :class="{ 'is-immersive': isImmersive }"
  >
    <header v-show="!isFullscreen" class="reader-toolbar">
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
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMangaStore } from '../stores/manga'
import { useReaderStore } from '../stores/reader'
import { MangaApi } from '../services/mangaApi'
import AdultContentGate from '../components/AdultContentGate.vue'
import { useAuthStore } from '../stores/auth'
import { canReadManga } from '../utils/ageRestriction'

export default {
  name: 'ReaderView',
  components: { AdultContentGate },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const mangaStore = useMangaStore()
    const readerStore = useReaderStore()
    const authStore = useAuthStore()
    const readerRoot = ref(null)
    const readerViewport = ref(null)
    const isNativeFullscreen = ref(false)
    const isImmersive = ref(false)
    const isFullscreen = computed(() => isNativeFullscreen.value || isImmersive.value)

    const manga = computed(() =>
      mangaStore.mangaList.find((item) => item.id === Number(route.params.mangaId))
    )
    const chapter = computed(() =>
      manga.value?.chapters.find((item) => item.id === Number(route.params.chapterId))
    )
    const page = computed(() => chapter.value?.pages[readerStore.currentPage - 1])

    const readAccess = computed(() => canReadManga(manga.value, authStore.user))

    const nextPage = () => {
      readerStore.nextPage(chapter.value.pages.length)
      readerStore.saveProgress(Number(route.params.mangaId))
    }
    const prevPage = () => {
      readerStore.prevPage()
      readerStore.saveProgress(Number(route.params.mangaId))
    }

    const getFullscreenElement = () =>
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      null

    const syncFullscreenState = () => {
      isNativeFullscreen.value = getFullscreenElement() === readerViewport.value
    }

    const requestElementFullscreen = (el) => {
      const request =
        el.requestFullscreen?.bind(el) ||
        el.webkitRequestFullscreen?.bind(el) ||
        el.msRequestFullscreen?.bind(el)
      return request ? request() : Promise.reject(new Error('Fullscreen API unavailable'))
    }

    const exitDocumentFullscreen = () => {
      const exit =
        document.exitFullscreen?.bind(document) ||
        document.webkitExitFullscreen?.bind(document) ||
        document.msExitFullscreen?.bind(document)
      if (!exit || !getFullscreenElement()) {
        return Promise.resolve()
      }
      return exit().catch(() => undefined)
    }

    const exitImmersive = () => {
      isImmersive.value = false
      document.body.classList.remove('reader-immersive-open')
    }

    const exitFullscreenIfNeeded = async () => {
      exitImmersive()
      const el = readerViewport.value
      if (!el || getFullscreenElement() !== el) {
        return
      }
      await exitDocumentFullscreen()
      syncFullscreenState()
    }

    const enterImmersive = () => {
      isImmersive.value = true
      document.body.classList.add('reader-immersive-open')
    }

    const toggleFullscreen = async () => {
      if (isImmersive.value) {
        await exitFullscreenIfNeeded()
        return
      }

      const el = readerViewport.value
      if (el && getFullscreenElement() === el) {
        await exitFullscreenIfNeeded()
        return
      }

      await nextTick()

      if (el) {
        try {
          await requestElementFullscreen(el)
          syncFullscreenState()
          if (getFullscreenElement() === el) {
            return
          }
        } catch {
          /* браузер отклонил — включаем CSS-режим */
        }
      }

      enterImmersive()
    }

    const closeManga = async () => {
      await exitFullscreenIfNeeded()
      if (manga.value?.id) {
        await router.push(`/manga/${manga.value.id}`)
      }
    }

    const onFullscreenChange = () => {
      syncFullscreenState()
      if (!getFullscreenElement() && !isImmersive.value) {
        isNativeFullscreen.value = false
      }
    }

    const onKeydown = (event) => {
      if (event.key === 'Escape' && isFullscreen.value) {
        exitFullscreenIfNeeded()
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
      if (mangaStore.mangaList.length) {
        readerStore.ensureProgressMigrated(mangaStore.mangaList)
      }
      readerStore.loadChapter(
        Number(route.params.chapterId),
        Number(route.params.mangaId)
      )
      document.addEventListener('fullscreenchange', onFullscreenChange)
      document.addEventListener('webkitfullscreenchange', onFullscreenChange)
      document.addEventListener('keydown', onKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
      document.removeEventListener('keydown', onKeydown)
      exitFullscreenIfNeeded()
      readerStore.saveProgress(Number(route.params.mangaId))
    })

    return {
      manga,
      readAccess,
      chapter,
      page,
      readerStore,
      readerRoot,
      readerViewport,
      isFullscreen,
      isImmersive,
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
  line-height: 1;
}

.tool-btn:not(.tool-btn-close):hover {
  border-color: #e291b0;
  background: #fff;
}

.tool-btn-close {
  background: linear-gradient(135deg, #e91e7a, #c2185b);
  color: #fff;
  border-color: #b0154f;
}

.tool-btn-close:hover {
  background: linear-gradient(135deg, #f472b6, #db2777);
  color: #fff;
  border-color: #9d174d;
  filter: brightness(1.06);
}

.reader.is-immersive {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  margin: 0;
  padding: 12px;
  box-sizing: border-box;
  background: #121016;
}

.reader-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

.reader.is-immersive .reader-wrap,
.reader.is-immersive .reader-stage {
  align-items: center;
  height: 100%;
}

.reader-stage {
  position: relative;
  width: 100%;
  max-width: min(100%, 900px);
  line-height: 0;
}

.reader.is-immersive .reader-stage {
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

.reader.is-immersive .reader-page {
  max-width: 100vw;
  max-height: calc(100dvh - 24px);
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
    position: sticky;
    top: 52px;
    z-index: 5;
    background: rgba(255, 246, 251, 0.95);
    margin: -4px -2px 8px;
    padding: 10px 8px 12px;
    border-radius: 10px;
    border: 1px solid #efbfd3;
  }

  .reader-toolbar-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .tool-btn-close {
    grid-column: 1 / -1;
  }

  .tool-btn {
    flex: 1 1 auto;
  }
}
</style>

<style>
/* Псевдо fullscreen не наследует scoped-атрибут — стили выносим отдельно */
.reader-viewport:fullscreen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #121016;
  box-sizing: border-box;
}

.reader-viewport:fullscreen .reader-wrap,
.reader-viewport:fullscreen .reader-stage {
  align-items: center;
  height: 100%;
}

.reader-viewport:fullscreen .reader-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  height: 100%;
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

body.reader-immersive-open {
  overflow: hidden;
}

body.reader-immersive-open .header,
body.reader-immersive-open .footer {
  display: none;
}
</style>
