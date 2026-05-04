<template>
  <section>
    <h1>Личный кабинет</h1>
    <div v-if="authStore.user" class="card">
      <p><strong>Логин:</strong> {{ authStore.user.login }}</p>
      <p><strong>Роль:</strong> {{ authStore.user.role }}</p>
      <p><strong>Прогресс чтения:</strong> {{ Object.keys(readerStore.progress).length }} глав</p>
      <button @click="logout">Выйти</button>
    </div>
    <p v-else>Вы не авторизованы. Перейдите на страницу входа.</p>

    <div class="favorites" v-if="mangaStore.favoriteManga.length">
      <h2>Избранное</h2>
      <ul>
        <li v-for="item in mangaStore.favoriteManga" :key="item.id">
          <RouterLink :to="`/manga/${item.id}`">{{ item.title }}</RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMangaStore } from '../stores/manga'
import { useReaderStore } from '../stores/reader'

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const mangaStore = useMangaStore()
    const readerStore = useReaderStore()
    const logout = async () => {
      authStore.logout()
      await router.push('/auth')
    }
    onMounted(async () => {
      if (!mangaStore.mangaList.length) {
        await mangaStore.fetchGenres()
        await mangaStore.fetchCatalog()
      }
    })
    return { authStore, mangaStore, readerStore, logout }
  }
}
</script>

<style scoped>
.card {
  width: 100%;
  max-width: 520px;
  background: #fff8fc;
  border: 1px solid #efbfd3;
  border-radius: 12px;
  padding: 14px;
}
button {
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  min-height: 40px;
}
.favorites {
  margin-top: 16px;
}
.favorites ul {
  list-style: none;
  padding: 0;
  max-width: 600px;
}
.favorites li {
  margin: 6px 0;
  background: #fff8fc;
  border: 1px solid #efbfd3;
  border-radius: 8px;
  padding: 8px 10px;
}
</style>
