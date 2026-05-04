<template>
  <section class="admin">
    <h1>Админ-панель</h1>
    <p>Модуль добавления новой манги и глав.</p>

    <div class="card">
      <h2>Добавить мангу</h2>
      <form @submit.prevent="createManga">
        <input v-model.trim="title" type="text" placeholder="Название" required>
        <textarea v-model.trim="description" placeholder="Описание" rows="3" required></textarea>
        <input v-model.trim="genreIdsText" type="text" placeholder="Жанры через запятую, например: 1,2">
        <button type="submit">Добавить</button>
      </form>
    </div>

    <div class="card">
      <h2>Добавить главу</h2>
      <form @submit.prevent="createChapter">
        <select v-model="selectedMangaId" required>
          <option disabled value="">Выберите тайтл</option>
          <option v-for="item in mangaStore.mangaList" :key="item.id" :value="item.id">{{ item.title }}</option>
        </select>
        <input v-model.number="chapterNumber" type="number" min="1" placeholder="Номер главы" required>
        <input v-model.trim="chapterTitle" type="text" placeholder="Название главы" required>
        <button type="submit">Добавить главу</button>
      </form>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useMangaStore } from '../stores/manga'
import { MangaApi } from '../services/mangaApi'

export default {
  name: 'AdminView',
  setup() {
    const mangaStore = useMangaStore()
    const title = ref('')
    const description = ref('')
    const genreIdsText = ref('')
    const selectedMangaId = ref('')
    const chapterNumber = ref(1)
    const chapterTitle = ref('')

    const createManga = async () => {
      const genres = genreIdsText.value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter(Boolean)
      await MangaApi.addManga({
        title: title.value,
        description: description.value,
        genres
      })
      await mangaStore.fetchCatalog()
      title.value = ''
      description.value = ''
      genreIdsText.value = ''
    }

    const createChapter = async () => {
      await MangaApi.addChapter(selectedMangaId.value, {
        number: chapterNumber.value,
        title: chapterTitle.value,
        pages: []
      })
      await mangaStore.fetchCatalog()
      chapterNumber.value = 1
      chapterTitle.value = ''
    }

    onMounted(async () => {
      await mangaStore.fetchGenres()
      await mangaStore.fetchCatalog()
    })

    return {
      mangaStore,
      title,
      description,
      genreIdsText,
      selectedMangaId,
      chapterNumber,
      chapterTitle,
      createManga,
      createChapter
    }
  }
}
</script>

<style scoped>
.admin {
  display: grid;
  gap: 14px;
}
.card {
  border: 1px solid #efbfd3;
  border-radius: 12px;
  padding: 12px;
  background: #fff8fc;
}
form {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;
}
input,
textarea,
select {
  border-radius: 8px;
  border: 1px solid #efbfd3;
  min-height: 42px;
  padding: 8px 10px;
  width: 100%;
}
button {
  border: none;
  border-radius: 8px;
  background: #ff5e9a;
  color: #fff;
  padding: 8px 10px;
  cursor: pointer;
  min-height: 40px;
}
</style>
