<template>
  <section class="profile">
    <template v-if="authStore.user">
      <header class="profile-hero">
        <div class="profile-identity">
          <div class="avatar-block">
            <label class="avatar-picker" :title="avatarUrl ? 'Сменить фото' : 'Загрузить фото'">
              <input
                ref="avatarInput"
                type="file"
                class="avatar-input"
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="onAvatarChange"
              >
              <img
                v-if="avatarUrl"
                class="avatar-img"
                :src="avatarUrl"
                :alt="'Аватар ' + authStore.user.login"
              >
              <span v-else class="avatar-placeholder">
                <span class="upload-icon" aria-hidden="true">+</span>
                <span class="upload-text">Загрузить фото</span>
              </span>
            </label>
            <p v-if="avatarError" class="avatar-error">{{ avatarError }}</p>
          </div>

          <div class="identity-main">
            <h1 class="profile-name">{{ authStore.user.login }}</h1>
            <label class="bio-field">
              <span class="bio-label">О себе</span>
              <textarea
                v-model="bio"
                class="bio-input"
                rows="3"
                maxlength="500"
                placeholder="Расскажите о себе: любимые жанры, что читаете сейчас..."
                @blur="saveBio"
              />
              <span class="bio-counter">{{ bio.length }} / 500</span>
            </label>
            <label class="bio-field">
              <span class="bio-label">Дата рождения</span>
              <input
                v-model="birthDate"
                class="bio-input bio-input--date"
                type="date"
                :max="maxBirthDate"
                @change="saveBirthDate"
              >
              <span class="bio-counter">Нужна для доступа к манге 18+</span>
            </label>
          </div>
        </div>
        <div class="hero-actions">
          <RouterLink class="btn btn-ghost" to="/catalog">Каталог</RouterLink>
          <button type="button" class="btn btn-logout" @click="logout">Выйти</button>
        </div>
      </header>

      <div class="stats-grid">
        <article class="stat-card">
          <span class="stat-value">{{ mangaStore.favorites.length }}</span>
          <span class="stat-label">В избранном</span>
        </article>
        <article class="stat-card">
          <span class="stat-value">{{ mangaStore.planned.length }}</span>
          <span class="stat-label">В планах</span>
        </article>
        <article class="stat-card">
          <span class="stat-value">{{ progressCount }}</span>
          <span class="stat-label">Глав с прогрессом</span>
        </article>
        <article class="stat-card">
          <span class="stat-value">{{ ratedCount }}</span>
          <span class="stat-label">Ваших оценок</span>
        </article>
      </div>

      <section v-if="continueReading.length" class="panel">
        <header class="panel-head">
          <h2 class="panel-title">Продолжить чтение</h2>
          <span class="panel-count">{{ continueReading.length }}</span>
        </header>
        <div class="continue-list">
          <article v-for="item in continueReading" :key="item.manga.id" class="continue-item">
            <RouterLink :to="`/manga/${item.manga.id}`" class="continue-cover-link">
              <img
                class="continue-cover"
                :src="item.manga.coverUrl"
                :alt="item.manga.title"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
              >
            </RouterLink>
            <div class="continue-body">
              <RouterLink :to="`/manga/${item.manga.id}`" class="continue-title">
                {{ item.manga.title }}
              </RouterLink>
              <p class="continue-meta">
                Глава {{ item.chapter.number }} · стр. {{ item.page }}
                <span v-if="item.chapter.title"> · {{ item.chapter.title }}</span>
              </p>
              <RouterLink class="continue-btn" :to="item.readerLink">Продолжить</RouterLink>
            </div>
          </article>
        </div>
      </section>

      <section class="panel">
        <header class="panel-head">
          <h2 class="panel-title">Избранное</h2>
          <span class="panel-count">{{ mangaStore.favoriteManga.length }}</span>
        </header>
        <div v-if="mangaStore.favoriteManga.length" class="manga-grid">
          <article v-for="item in mangaStore.favoriteManga" :key="item.id" class="manga-card">
            <RouterLink :to="`/manga/${item.id}`" class="manga-cover-link">
              <img
                class="manga-cover"
                :src="item.coverUrl"
                :alt="item.title"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
              >
            </RouterLink>
            <div class="manga-card-body">
              <RouterLink :to="`/manga/${item.id}`" class="manga-title">{{ item.title }}</RouterLink>
              <p class="manga-genres">{{ genreNames(item.genres) }}</p>
              <p class="manga-meta">
                <span class="status" :class="item.status === 'COMPLETED' ? 'done' : 'ongoing'">
                  {{ item.status === 'COMPLETED' ? 'Завершена' : 'Онгоинг' }}
                </span>
                <span>{{ (item.rating ?? 0).toFixed(2) }} / 10</span>
              </p>
              <button type="button" class="mini-btn" @click="mangaStore.toggleFavorite(item.id)">
                Убрать из избранного
              </button>
            </div>
          </article>
        </div>
        <p v-else class="empty">
          Пока пусто. Добавляйте тайтлы с карточки манги кнопкой «В избранное».
          <RouterLink to="/catalog">Перейти в каталог</RouterLink>
        </p>
      </section>

      <section class="panel">
        <header class="panel-head">
          <h2 class="panel-title">В планах</h2>
          <span class="panel-count">{{ mangaStore.plannedManga.length }}</span>
        </header>
        <div v-if="mangaStore.plannedManga.length" class="manga-grid">
          <article v-for="item in mangaStore.plannedManga" :key="item.id" class="manga-card">
            <RouterLink :to="`/manga/${item.id}`" class="manga-cover-link">
              <img
                class="manga-cover"
                :src="item.coverUrl"
                :alt="item.title"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
              >
            </RouterLink>
            <div class="manga-card-body">
              <RouterLink :to="`/manga/${item.id}`" class="manga-title">{{ item.title }}</RouterLink>
              <p class="manga-genres">{{ genreNames(item.genres) }}</p>
              <p class="manga-meta">
                <span>{{ (item.rating ?? 0).toFixed(2) }} / 10</span>
                <span>·</span>
                <span>{{ item.chapters?.length || 0 }} гл. на сайте</span>
              </p>
              <button type="button" class="mini-btn ghost" @click="mangaStore.togglePlanned(item.id)">
                Убрать из планов
              </button>
            </div>
          </article>
        </div>
        <p v-else class="empty">
          Список «В планы» помогает отложить тайтлы на потом.
          <RouterLink to="/catalog">Найти мангу в каталоге</RouterLink>
        </p>
      </section>

      <section v-if="recentRatings.length" class="panel panel--muted">
        <header class="panel-head">
          <h2 class="panel-title">Недавние оценки</h2>
        </header>
        <ul class="rated-list">
          <li v-for="row in recentRatings" :key="row.manga.id" class="rated-item">
            <RouterLink :to="`/manga/${row.manga.id}`" class="rated-link">
              <img
                class="rated-thumb"
                :src="row.manga.coverUrl"
                :alt="row.manga.title"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
              >
              <span class="rated-title">{{ row.manga.title }}</span>
            </RouterLink>
            <span class="rated-stars">★ {{ row.stars }}</span>
          </li>
        </ul>
      </section>
    </template>

    <section v-else class="guest-card">
      <h1>Личный кабинет</h1>
      <p>Войдите, чтобы видеть избранное, планы и прогресс чтения.</p>
      <RouterLink class="btn btn-primary" to="/auth">Войти или зарегистрироваться</RouterLink>
    </section>
  </section>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMangaStore } from '../stores/manga'
import { useReaderStore } from '../stores/reader'
import { useMangaUserRatingsStore } from '../stores/mangaUserRatings'
import { useUserProfileStore } from '../stores/userProfile'

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const mangaStore = useMangaStore()
    const readerStore = useReaderStore()
    const ratingsStore = useMangaUserRatingsStore()
    const profileStore = useUserProfileStore()

    const avatarInput = ref(null)
    const avatarUrl = ref('')
    const bio = ref('')
    const birthDate = ref('')
    const maxBirthDate = new Date().toISOString().slice(0, 10)
    const avatarError = ref('')

    const loadProfile = () => {
      const login = authStore.user?.login
      if (!login) {
        avatarUrl.value = ''
        bio.value = ''
        birthDate.value = ''
        return
      }
      const saved = profileStore.getForLogin(login)
      avatarUrl.value = saved.avatarUrl
      bio.value = saved.bio
      birthDate.value = authStore.user?.birthDate || ''
      avatarError.value = ''
    }

    watch(
      () => authStore.user?.login,
      () => loadProfile(),
      { immediate: true }
    )

    watch(
      () => authStore.user?.birthDate,
      (value) => {
        birthDate.value = value || ''
      }
    )

    const onAvatarChange = (event) => {
      avatarError.value = ''
      const file = event.target.files?.[0]
      if (!file) {
        return
      }
      if (!file.type.startsWith('image/')) {
        avatarError.value = 'Выберите файл изображения (JPG, PNG, WebP или GIF).'
        return
      }
      if (file.size > MAX_AVATAR_BYTES) {
        avatarError.value = 'Файл слишком большой. Максимум 1,5 МБ.'
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = String(reader.result || '')
        avatarUrl.value = dataUrl
        profileStore.setAvatar(authStore.user.login, dataUrl)
        if (avatarInput.value) {
          avatarInput.value.value = ''
        }
      }
      reader.onerror = () => {
        avatarError.value = 'Не удалось прочитать файл.'
      }
      reader.readAsDataURL(file)
    }

    const saveBio = () => {
      if (!authStore.user?.login) {
        return
      }
      profileStore.setBio(authStore.user.login, bio.value)
    }

    const saveBirthDate = async () => {
      if (!authStore.user?.login || !birthDate.value) {
        return
      }
      try {
        await authStore.updateBirthDate(birthDate.value)
      } catch (error) {
        avatarError.value = error.message || 'Не удалось сохранить дату рождения'
      }
    }

    const progressCount = computed(() => Object.keys(readerStore.progress).length)

    const ratedCount = computed(() =>
      Object.values(ratingsStore.byManga).filter((entry) => entry.userStars != null).length
    )

    const continueReading = computed(() => {
      readerStore.ensureProgressMigrated(mangaStore.mangaList)

      const items = []
      for (const [mangaIdStr, saved] of Object.entries(readerStore.progress)) {
        if (!saved || typeof saved !== 'object' || saved.chapterId == null) {
          continue
        }
        const mangaId = Number(mangaIdStr)
        const manga = mangaStore.mangaList.find((m) => m.id === mangaId)
        if (!manga) {
          continue
        }
        const chapter = (manga.chapters || []).find(
          (ch) => ch.id === Number(saved.chapterId)
        )
        if (!chapter) {
          continue
        }
        items.push({
          manga,
          chapter,
          page: Number(saved.page) || 1,
          readerLink: `/reader/${manga.id}/${chapter.id}`,
          sortKey: Number(saved.updatedAt) || 0
        })
      }
      return items.sort((a, b) => b.sortKey - a.sortKey).slice(0, 8)
    })

    const recentRatings = computed(() => {
      const rows = []
      for (const [idStr, entry] of Object.entries(ratingsStore.byManga)) {
        if (entry.userStars == null) {
          continue
        }
        const mangaId = Number(idStr)
        const manga = mangaStore.mangaList.find((m) => m.id === mangaId)
        if (manga) {
          rows.push({ manga, stars: entry.userStars, mangaId })
        }
      }
      return rows.slice(0, 6)
    })

    const genreNames = (genreIds) => {
      if (!genreIds?.length) {
        return '—'
      }
      return mangaStore.genres
        .filter((g) => genreIds.includes(g.id))
        .map((g) => g.name)
        .slice(0, 3)
        .join(' · ')
    }

    const logout = async () => {
      authStore.logout()
      await router.push('/auth')
    }

    onMounted(async () => {
      if (!mangaStore.mangaList.length) {
        await mangaStore.fetchGenres()
        await mangaStore.fetchCatalog()
      }
      readerStore.ensureProgressMigrated(mangaStore.mangaList)
    })

    return {
      authStore,
      mangaStore,
      avatarInput,
      avatarUrl,
      bio,
      birthDate,
      maxBirthDate,
      avatarError,
      onAvatarChange,
      saveBio,
      saveBirthDate,
      progressCount,
      ratedCount,
      continueReading,
      recentRatings,
      genreNames,
      logout
    }
  }
}
</script>

<style scoped>
.profile {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.profile-hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px 20px;
  align-items: start;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid #efbfd3;
  background: linear-gradient(135deg, #ffffff 0%, #fff0f7 55%, #ffe8f4 100%);
  box-shadow: 0 10px 28px rgba(153, 73, 110, 0.1);
}

.profile-identity {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  align-items: start;
  min-width: 0;
}

.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.avatar-picker {
  position: relative;
  display: block;
  width: 160px;
  height: 160px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #e291b0;
  background: linear-gradient(145deg, #fff8fc 0%, #ffe8f4 100%);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.avatar-picker:hover {
  border-color: #c2185b;
  box-shadow: 0 8px 20px rgba(194, 24, 91, 0.18);
}

.avatar-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  text-align: center;
  color: #9d4a6f;
}

.upload-icon {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  background: linear-gradient(145deg, #ff82b4, #c2185b);
}

.upload-text {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.avatar-error {
  margin: 0;
  max-width: 160px;
  font-size: 11px;
  line-height: 1.3;
  color: #b91c1c;
  text-align: center;
}

.identity-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bio-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.bio-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9d4a6f;
}

.bio-input {
  width: 100%;
  min-height: 88px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #efbfd3;
  background: rgba(255, 255, 255, 0.85);
  color: #4e2a3a;
  font-size: 15px;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
}

.bio-input:focus {
  outline: none;
  border-color: #e291b0;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.15);
}

.bio-input::placeholder {
  color: #b89aaa;
}

.bio-counter {
  align-self: flex-end;
  font-size: 11px;
  color: #9d4a6f;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9d4a6f;
  font-weight: 700;
}

.profile-name {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 1.85rem);
  line-height: 1.1;
  color: #831843;
  font-weight: 800;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.role-badge.reader {
  background: #fce7f3;
  color: #9d174d;
  border: 1px solid #f9a8d4;
}

.role-badge.admin {
  background: #ede9fe;
  color: #5b21b6;
  border: 1px solid #c4b5fd;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}

.btn {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
}

.btn-ghost {
  background: #fff8fc;
  color: #a73667;
  border-color: #efbfd3;
}

.btn-ghost:hover {
  border-color: #e291b0;
}

.btn-logout {
  background: #fff;
  color: #74495b;
  border-color: #d5a2b7;
}

.btn-logout:hover {
  border-color: #c2185b;
  color: #c2185b;
}

.btn-primary {
  background: linear-gradient(135deg, #e91e7a, #c2185b);
  color: #fff;
  border-color: #b0154f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.stat-card {
  padding: 14px 12px;
  border-radius: 12px;
  border: 1px solid #efbfd3;
  background: #fffafc;
  text-align: center;
  box-shadow: 0 4px 14px rgba(153, 73, 110, 0.06);
}

.stat-value {
  display: block;
  font-size: 1.65rem;
  font-weight: 800;
  color: #831843;
  line-height: 1.1;
}

.stat-label {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #7f3652;
  font-weight: 600;
}

.panel {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffff 0%, #fff8fc 100%);
  padding: 14px 16px;
  box-shadow: 0 6px 18px rgba(153, 73, 110, 0.07);
}

.panel--muted {
  background: linear-gradient(150deg, #fffafc 0%, #fff2f8 100%);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.panel-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #831843;
}

.panel-count {
  min-width: 28px;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: #fce7f3;
  color: #9d174d;
  font-size: 13px;
  font-weight: 700;
}

.continue-list {
  display: grid;
  gap: 10px;
}

.continue-item {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #f5d4e3;
  background: #fff;
}

.continue-cover {
  width: 64px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #d5a2b7;
}

.continue-title {
  font-size: 15px;
  font-weight: 700;
  color: #831843;
  text-decoration: none;
}

.continue-title:hover {
  color: #c2185b;
}

.continue-meta {
  margin: 4px 0 8px;
  font-size: 13px;
  color: #74495b;
}

.continue-btn {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff82b4, #ec4899);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.manga-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.manga-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.manga-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #d5a2b7;
  box-shadow: 0 4px 12px rgba(90, 61, 73, 0.12);
}

.manga-title {
  font-size: 15px;
  font-weight: 700;
  color: #831843;
  text-decoration: none;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.manga-title:hover {
  color: #c2185b;
}

.manga-genres {
  margin: 0;
  font-size: 12px;
  color: #7f3652;
  line-height: 1.3;
}

.manga-meta {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: #5a2b3e;
}

.status {
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.status.done {
  background: #dcfce7;
  color: #166534;
}

.status.ongoing {
  background: #fce7f3;
  color: #9d174d;
}

.mini-btn {
  margin-top: 4px;
  align-self: flex-start;
  min-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #efbfd3;
  background: #fff8fc;
  color: #a73667;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.mini-btn.ghost:hover,
.mini-btn:hover {
  border-color: #e291b0;
}

.rated-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.rated-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #f5d4e3;
  background: #fff;
}

.rated-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}

.rated-thumb {
  width: 40px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #d5a2b7;
  flex-shrink: 0;
}

.rated-title {
  font-size: 14px;
  font-weight: 600;
  color: #4e2a3a;
}

.rated-stars {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  color: #b45309;
}

.empty {
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff8fc;
  border: 1px dashed #efbfd3;
  font-size: 14px;
  color: #74495b;
  line-height: 1.5;
}

.empty a {
  display: inline-block;
  margin-left: 6px;
  color: #c2185b;
  font-weight: 600;
}

.guest-card {
  max-width: 480px;
  margin: 0 auto;
  padding: 28px 24px;
  text-align: center;
  border-radius: 16px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffff 0%, #fff5fa 100%);
  box-shadow: 0 10px 28px rgba(153, 73, 110, 0.1);
}

.guest-card h1 {
  margin: 0 0 10px;
  color: #831843;
}

.guest-card p {
  margin: 0 0 18px;
  color: #74495b;
  font-size: 15px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .profile-hero {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 520px) {
  .profile-hero {
    padding: 14px;
  }

  .profile-identity {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .identity-main {
    width: 100%;
    align-items: stretch;
  }

  .hero-meta {
    justify-content: center;
  }

  .hero-actions {
    justify-content: stretch;
    width: 100%;
    flex-direction: column;
  }

  .hero-actions .btn {
    width: 100%;
  }

  .bio-counter {
    align-self: center;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .continue-item {
    grid-template-columns: 52px 1fr;
    gap: 10px;
    padding: 10px;
  }

  .continue-cover {
    width: 52px;
  }

  .continue-meta {
    font-size: 12px;
    line-height: 1.4;
    word-break: break-word;
  }

  .continue-btn {
    width: 100%;
  }

  .panel {
    padding: 12px 14px;
  }

  .manga-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .manga-title {
    font-size: 12px;
    line-height: 1.2;
    -webkit-line-clamp: 2;
  }

  .manga-genres {
    font-size: 10px;
  }

  .mini-btn {
    font-size: 11px;
    min-height: 32px;
    padding: 0 8px;
  }
}
</style>
