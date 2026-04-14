<template>
  <section v-if="chapter && page">
    <h1>{{ manga.title }} — Глава {{ chapter.number }}</h1>
    <p>Страница {{ readerStore.currentPage }} / {{ chapter.pages.length }}</p>

    <img :src="page.imageUrl" :alt="`page-${page.number}`">

    <div class="controls">
      <button @click="prevPage">Назад</button>
      <button @click="nextPage">Вперед</button>
      <RouterLink :to="`/manga/${manga.id}`">К главам</RouterLink>
    </div>
  </section>
  <p v-else>Глава не найдена.</p>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMangaStore } from '../stores/manga'
import { useReaderStore } from '../stores/reader'

export default {
  name: 'ReaderView',
  setup() {
    const route = useRoute()
    const mangaStore = useMangaStore()
    const readerStore = useReaderStore()
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

    onMounted(() => {
      if (!mangaStore.mangaList.length) {
        mangaStore.fetchCatalog()
      }
      readerStore.loadChapter(Number(route.params.chapterId))
    })

    onUnmounted(() => {
      readerStore.saveProgress()
    })

    return { manga, chapter, page, readerStore, nextPage, prevPage }
  }
}
</script>

<style scoped>
img {
  width: min(100%, 700px);
  display: block;
  margin: 14px 0;
  border-radius: 8px;
}
.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}
button {
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
a {
  color: #60a5fa;
}
</style>
