<template>
  <section v-if="manga">
    <h1>{{ manga.title }}</h1>
    <p>{{ manga.description }}</p>
    <p>Глав: {{ manga.chapters.length }}</p>

    <h2>Список глав</h2>
    <ul class="chapters">
      <li v-for="chapter in manga.chapters" :key="chapter.id">
        <span>Глава {{ chapter.number }}: {{ chapter.title }}</span>
        <RouterLink :to="`/reader/${manga.id}/${chapter.id}`">Читать</RouterLink>
      </li>
    </ul>
  </section>
  <p v-else>Тайтл не найден.</p>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMangaStore } from '../stores/manga'
import { MangaApi } from '../services/mangaApi'

export default {
  name: 'MangaDetailView',
  setup() {
    const route = useRoute()
    const mangaStore = useMangaStore()

    onMounted(() => {
      if (!mangaStore.mangaList.length) {
        mangaStore.fetchCatalog()
      }
      MangaApi.getById(route.params.id).then((item) => {
        if (item && !mangaStore.mangaList.find((manga) => manga.id === item.id)) {
          mangaStore.mangaList = [...mangaStore.mangaList, item]
        }
      })
    })

    const manga = computed(() =>
      mangaStore.mangaList.find((item) => item.id === Number(route.params.id))
    )

    return { manga }
  }
}
</script>

<style scoped>
.chapters {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 10px;
}
li {
  background: #fff8fc;
  border: 1px solid #efbfd3;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
a {
  color: #a73667;
}
</style>
