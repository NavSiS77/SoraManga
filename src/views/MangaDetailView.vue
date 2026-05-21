<template>
  <section v-if="manga" class="detail">
    <div class="hero">
      <div class="cover-wrap">
        <img
          class="cover"
          :src="manga.coverUrl"
          :alt="manga.title"
          loading="eager"
          decoding="async"
          referrerpolicy="no-referrer"
        >
      </div>
      <div class="hero-main">
        <p class="eyebrow">Тайтл</p>
        <h1 class="title">{{ manga.title }}</h1>
        <p class="hero-description">{{ longDescription }}</p>
        <p v-if="genreLine" class="genres-line">{{ genreLine }}</p>

        <div class="actions">
          <component
            :is="firstChapterLink ? 'RouterLink' : 'span'"
            v-bind="firstChapterLink ? { to: firstChapterLink } : {}"
            class="btn btn-primary"
            :class="{ 'is-disabled': !firstChapterLink }"
          >
            Читать с {{ firstChapterLabel }}
          </component>
          <button
            type="button"
            class="btn btn-ghost"
            :class="{ 'is-favorite': mangaStore.isFavorite(manga.id) }"
            @click="mangaStore.toggleFavorite(manga.id)"
          >
            {{ mangaStore.isFavorite(manga.id) ? 'В избранном' : 'В избранное' }}
          </button>
          <button
            type="button"
            class="btn btn-ghost"
            :class="{ 'is-planned': mangaStore.isPlanned(manga.id) }"
            @click="mangaStore.togglePlanned(manga.id)"
          >
            {{ mangaStore.isPlanned(manga.id) ? 'В планах' : 'В планы' }}
          </button>
        </div>
      </div>
    </div>

    <section class="meta-block">
      <h2 class="panel-title">О манге</h2>
      <dl class="meta-strip">
          <div class="meta-item">
            <dt>Год выпуска</dt>
            <dd>{{ meta.year || '—' }}</dd>
          </div>
          <div class="meta-item">
            <dt>Статус</dt>
            <dd>
              <span class="pill" :class="manga.status === 'COMPLETED' ? 'done' : 'ongoing'">
                {{ manga.status === 'COMPLETED' ? 'Завершена' : 'Онгоинг' }}
              </span>
            </dd>
          </div>
          <div class="meta-item">
            <dt>Глав на сайте</dt>
            <dd>{{ manga.chapters.length }}</dd>
          </div>
          <div class="meta-item">
            <dt>Глав в оригинале</dt>
            <dd>{{ totalChaptersLabel }}</dd>
          </div>
          <div class="meta-item">
            <dt>Издатель</dt>
            <dd>{{ meta.publisher }}</dd>
          </div>
          <div class="meta-item">
            <dt>Автор сюжета</dt>
            <dd>{{ meta.author }}</dd>
          </div>
          <div class="meta-item">
            <dt>Художник</dt>
            <dd>{{ meta.artist }}</dd>
          </div>
          <div class="meta-item">
            <dt>Рейтинг</dt>
            <dd>
              {{ (manga.rating ?? 0).toFixed(2) }} / 10
              <span class="rating-note">Shikimori</span>
            </dd>
          </div>
      </dl>
    </section>

    <section v-if="manga" class="ratings-block">
      <MangaUserRatings
        :manga-id="manga.id"
        :base-mean="Number(manga.rating) || 8"
        :title="manga.title"
      />
    </section>

    <section class="chapters-block">
      <h2 class="panel-title">Список глав</h2>
      <ul v-if="sortedChapters.length" class="chapters">
        <li v-for="chapter in sortedChapters" :key="chapter.id">
          <span class="ch-label">Глава {{ chapter.number }}: {{ chapter.title }}</span>
          <RouterLink class="ch-link" :to="`/reader/${manga.id}/${chapter.id}`">Читать</RouterLink>
        </li>
      </ul>
      <p v-else class="empty-chapters">Пока нет загруженных глав — загляни позже или попроси администратора добавить том.</p>
    </section>

    <section v-if="similar.length" class="similar-block">
      <h2 class="panel-title">Похожие тайтлы</h2>
      <p class="similar-hint">Подобраны по пересечению жанров и рейтингу.</p>
      <div class="similar-grid">
        <article v-for="item in similar" :key="item.id" class="similar-card">
          <RouterLink :to="`/manga/${item.id}`" class="similar-link">
            <img
              class="similar-cover"
              :src="item.coverUrl"
              :alt="item.title"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
            >
          </RouterLink>
          <RouterLink :to="`/manga/${item.id}`" class="similar-title">{{ item.title }}</RouterLink>
          <p class="similar-meta">
            <span>{{ item.rating?.toFixed(1) || '—' }}</span>
            ·
            <span>жанров: {{ item.sharedGenres }}</span>
          </p>
        </article>
      </div>
    </section>
  </section>
  <p v-else class="not-found">Тайтл не найден.</p>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMangaStore } from '../stores/manga'
import { MangaApi } from '../services/mangaApi'
import { getMangaExtendedMeta } from '../data/mangaExtraMeta'
import { getLongDescription } from '../data/mangaLongDescriptions'
import MangaUserRatings from '../components/MangaUserRatings.vue'

export default {
  name: 'MangaDetailView',
  components: { MangaUserRatings },
  setup() {
    const route = useRoute()
    const mangaStore = useMangaStore()

    const manga = computed(() =>
      mangaStore.mangaList.find((item) => item.id === Number(route.params.id))
    )

    const meta = computed(() => getMangaExtendedMeta(manga.value))

    const sortedChapters = computed(() => {
      const list = manga.value?.chapters ? [...manga.value.chapters] : []
      return list.sort((a, b) => Number(a.number) - Number(b.number))
    })

    const firstChapter = computed(() => sortedChapters.value[0] || null)

    const firstChapterLink = computed(() => {
      if (!manga.value || !firstChapter.value) {
        return null
      }
      return `/reader/${manga.value.id}/${firstChapter.value.id}`
    })

    const firstChapterLabel = computed(() =>
      firstChapter.value ? `главы ${firstChapter.value.number}` : 'начала'
    )

    const totalChaptersLabel = computed(() => {
      const n = meta.value.totalChapters
      if (n == null || n === '') {
        return '—'
      }
      return String(n)
    })

    const genreLine = computed(() => {
      const m = manga.value
      if (!m?.genres?.length) {
        return ''
      }
      return mangaStore.genres
        .filter((g) => m.genres.includes(g.id))
        .map((g) => g.name)
        .join(' · ')
    })

    const longDescription = computed(() => {
      const m = manga.value
      if (!m) {
        return ''
      }
      return getLongDescription(m.id, m.title, m.description, genreLine.value)
    })

    const similar = computed(() => {
      const m = manga.value
      if (!m || !mangaStore.mangaList.length) {
        return []
      }
      const myGenres = new Set(m.genres || [])
      return mangaStore.mangaList
        .filter((item) => item.id !== m.id)
        .map((item) => {
          const shared = (item.genres || []).filter((id) => myGenres.has(id)).length
          return { ...item, sharedGenres: shared }
        })
        .filter((item) => item.sharedGenres > 0)
        .sort((a, b) => {
          if (b.sharedGenres !== a.sharedGenres) {
            return b.sharedGenres - a.sharedGenres
          }
          return (b.rating || 0) - (a.rating || 0)
        })
        .slice(0, 6)
    })

    onMounted(async () => {
      await mangaStore.fetchGenres()
      if (!mangaStore.mangaList.length) {
        await mangaStore.fetchCatalog()
      }
      const item = await MangaApi.getById(route.params.id)
      if (item && !mangaStore.mangaList.find((row) => row.id === item.id)) {
        mangaStore.mangaList = [...mangaStore.mangaList, item]
      }
    })

    return {
      mangaStore,
      manga,
      meta,
      sortedChapters,
      firstChapterLink,
      firstChapterLabel,
      totalChaptersLabel,
      genreLine,
      longDescription,
      similar
    }
  }
}
</script>

<style scoped>
.detail {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.meta-block {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffff 0%, #fff8fc 100%);
  padding: 14px 18px;
  box-shadow: 0 6px 18px rgba(153, 73, 110, 0.08);
}

.meta-strip {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  margin: 0;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
}

.meta-item {
  flex: 1 1 0;
  min-width: 108px;
  margin: 0;
  padding: 6px 14px;
  border-right: 1px solid #ecd0de;
  text-align: center;
}

.meta-item:first-child {
  padding-left: 0;
}

.meta-item:last-child {
  border-right: none;
  padding-right: 0;
}

.meta-item dt {
  margin: 0 0 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9d4a6f;
  font-weight: 700;
  white-space: nowrap;
}

.meta-item dd {
  margin: 0;
  font-size: 15px;
  color: #4e2a3a;
  line-height: 1.35;
  font-weight: 500;
}

.rating-note {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 500;
  color: #9d4a6f;
}

.ratings-block {
  min-width: 0;
}

.hero {
  display: grid;
  grid-template-columns: minmax(200px, 280px) 1fr;
  gap: 20px;
  align-items: stretch;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffffee 0%, #ffe8f4cc 100%);
  box-shadow: 0 10px 24px rgba(153, 73, 110, 0.1);
}

.cover-wrap {
  position: relative;
  display: flex;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #d5a2b7;
  box-shadow: 0 6px 18px rgba(90, 61, 73, 0.18);
}

.cover {
  width: 100%;
  height: 100%;
  min-height: 320px;
  object-fit: cover;
  object-position: center top;
  display: block;
}

.hero-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9d4a6f;
  font-weight: 700;
}

.title {
  margin: 0;
  font-size: clamp(1.55rem, 3vw, 2.1rem);
  line-height: 1.12;
  color: #831843;
  font-weight: 800;
}

.hero-description {
  margin: 0;
  padding: 12px 14px;
  font-size: 15px;
  line-height: 1.6;
  color: #4e2a3a;
  white-space: pre-line;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid #f0d0df;
  border-radius: 10px;
  max-height: 14rem;
  overflow-y: auto;
}

.genres-line {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #7f3652;
  letter-spacing: 0.02em;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  line-height: 1.2;
}

.btn-primary {
  background: linear-gradient(135deg, #e91e7a, #c2185b);
  color: #fff;
  border-color: #b0154f;
  box-shadow: 0 4px 14px rgba(194, 24, 91, 0.35);
}

.btn-primary.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
  background: #e8b8cc;
  border-color: #e8b8cc;
}

.btn-ghost {
  background: #fff8fc;
  color: #a73667;
  border-color: #efbfd3;
}

.btn-ghost:hover {
  border-color: #e291b0;
}

.btn-ghost.is-favorite {
  background: linear-gradient(135deg, #ff82b4, #e91e7a);
  color: #fff;
  border-color: #db2777;
  box-shadow: 0 4px 14px rgba(236, 72, 153, 0.35);
}

.btn-ghost.is-favorite:hover {
  border-color: #be185d;
  filter: brightness(1.04);
}

.btn-ghost.is-planned {
  background: linear-gradient(135deg, #c4b5fd, #7c3aed);
  color: #fff;
  border-color: #6d28d9;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.32);
}

.btn-ghost.is-planned:hover {
  border-color: #5b21b6;
  filter: brightness(1.04);
}

.chapters-block,
.similar-block {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffffdd 0%, #ffe3f0a8 100%);
  padding: 16px 18px;
}

.panel-title {
  margin: 0 0 10px;
  font-size: 1.2rem;
  font-weight: 800;
  color: #831843;
}

.pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.pill.done {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.pill.ongoing {
  background: #fce7f3;
  color: #9d174d;
  border: 1px solid #f9a8d4;
}

.chapters {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
}

.chapters li {
  background: #fff8fc;
  border: 1px solid #efbfd3;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ch-label {
  color: #4e2a3a;
  font-size: 15px;
}

.ch-link {
  color: #c2185b;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  font-size: 15px;
}

.ch-link:hover {
  text-decoration: underline;
}

.empty-chapters {
  margin: 0;
  color: #74495b;
  font-size: 15px;
}

.similar-hint {
  margin: 0 0 10px;
  font-size: 14px;
  color: #74495b;
}

.similar-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1100px) {
  .similar-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .similar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

.similar-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.similar-link {
  display: block;
}

.similar-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #d5a2b7;
  box-shadow: 0 6px 14px rgba(90, 61, 73, 0.14);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.similar-link:hover .similar-cover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(90, 61, 73, 0.2);
}

.similar-title {
  font-size: 16px;
  font-weight: 700;
  color: #831843;
  text-decoration: none;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.similar-title:hover {
  color: #c2185b;
}

.similar-meta {
  margin: 0;
  font-size: 14px;
  color: #7f3652;
}

.not-found {
  color: #74495b;
  font-size: 14px;
}

@media (max-width: 640px) {
  .hero {
    grid-template-columns: minmax(140px, 42vw) 1fr;
    padding: 12px;
  }

  .cover {
    min-height: 240px;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .cover-wrap {
    max-width: 280px;
    margin: 0 auto;
    min-height: 360px;
  }

  .cover {
    min-height: 360px;
  }

  .actions {
    align-items: stretch;
  }
}
</style>
