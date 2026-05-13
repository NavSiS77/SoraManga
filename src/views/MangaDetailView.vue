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
        <p class="lead">{{ manga.description }}</p>
        <p class="genres-line">{{ genreLine }}</p>

        <div class="actions">
          <component
            :is="firstChapterLink ? 'RouterLink' : 'span'"
            v-bind="firstChapterLink ? { to: firstChapterLink } : {}"
            class="btn btn-primary"
            :class="{ 'is-disabled': !firstChapterLink }"
          >
            Читать с {{ firstChapterLabel }}
          </component>
          <button type="button" class="btn btn-ghost" @click="mangaStore.toggleFavorite(manga.id)">
            {{ mangaStore.isFavorite(manga.id) ? 'В избранном' : 'В избранное' }}
          </button>
          <button type="button" class="btn btn-ghost" @click="mangaStore.togglePlanned(manga.id)">
            {{ mangaStore.isPlanned(manga.id) ? 'В планах' : 'В планы' }}
          </button>
        </div>
      </div>
    </div>

    <section class="synopsis">
      <h2 class="synopsis-title">Описание</h2>
      <div class="synopsis-body">{{ longDescription }}</div>
    </section>

    <div class="meta-ratings-row">
      <div class="meta-panel">
        <h2 class="panel-title">О манге</h2>
        <dl class="meta-grid">
          <div class="meta-cell">
            <dt>Год выпуска</dt>
            <dd>{{ meta.year || '—' }}</dd>
          </div>
          <div class="meta-cell">
            <dt>Статус</dt>
            <dd>
              <span class="pill" :class="manga.status === 'COMPLETED' ? 'done' : 'ongoing'">
                {{ manga.status === 'COMPLETED' ? 'Завершена' : 'Онгоинг' }}
              </span>
            </dd>
          </div>
          <div class="meta-cell">
            <dt>Глав на сайте</dt>
            <dd>{{ manga.chapters.length }}</dd>
          </div>
          <div class="meta-cell">
            <dt>Глав в оригинале (ориентир)</dt>
            <dd>{{ totalChaptersLabel }}</dd>
          </div>
          <div class="meta-cell wide">
            <dt>Издатель</dt>
            <dd>{{ meta.publisher }}</dd>
          </div>
          <div class="meta-cell">
            <dt>Автор сюжета</dt>
            <dd>{{ meta.author }}</dd>
          </div>
          <div class="meta-cell">
            <dt>Художник</dt>
            <dd>{{ meta.artist }}</dd>
          </div>
          <div class="meta-cell">
            <dt>Рейтинг</dt>
            <dd>
              {{ (manga.rating ?? 0).toFixed(2) }} / 10
              <span class="rating-note">ориентир в духе Shikimori</span>
            </dd>
          </div>
        </dl>
      </div>

      <MangaUserRatings
        v-if="manga"
        class="ratings-slot"
        compact
        :manga-id="manga.id"
        :base-mean="Number(manga.rating) || 8"
        :title="manga.title"
      />
    </div>

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
  gap: 8px;
  min-width: 0;
}

.meta-ratings-row {
  display: grid;
  gap: 8px;
  align-items: start;
  min-width: 0;
}

@media (min-width: 880px) {
  .meta-ratings-row {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 300px);
  }
}

.ratings-slot {
  min-width: 0;
}

.hero {
  display: grid;
  grid-template-columns: minmax(110px, 168px) 1fr;
  gap: 12px;
  align-items: start;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffffee 0%, #ffe8f4cc 100%);
  box-shadow: 0 6px 16px rgba(153, 73, 110, 0.08);
}

.cover-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d5a2b7;
  box-shadow: 0 4px 12px rgba(90, 61, 73, 0.14);
}

.cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  height: auto;
  object-fit: cover;
  display: block;
}

.hero-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eyebrow {
  margin: 0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9d4a6f;
  font-weight: 700;
}

.title {
  margin: 0;
  font-size: clamp(1.2rem, 2.4vw, 1.55rem);
  line-height: 1.15;
  color: #831843;
  font-weight: 800;
}

.lead {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #5a2b3e;
}

.synopsis {
  border-radius: 12px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #fffffff2 0%, #fff5fb 100%);
  padding: 10px 12px;
  box-shadow: 0 4px 12px rgba(153, 73, 110, 0.06);
}

.synopsis-title {
  margin: 0 0 6px;
  font-size: 1rem;
  color: #831843;
}

.synopsis-body {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #4e2a3a;
  white-space: pre-line;
  max-height: 10.5rem;
  overflow-y: auto;
  padding-right: 4px;
}

.genres-line {
  margin: 0;
  font-size: 12px;
  color: #7f3652;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  line-height: 1.2;
}

.btn-primary {
  background: linear-gradient(135deg, #ff82b4, #ff5e9a);
  color: #fff;
  border-color: #ff5e9a;
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

.meta-panel,
.chapters-block,
.similar-block {
  border-radius: 12px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffffdd 0%, #ffe3f0a8 100%);
  padding: 10px 12px;
}

.panel-title {
  margin: 0 0 8px;
  font-size: 1rem;
  color: #831843;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 8px 10px;
  margin: 0;
}

.meta-cell {
  margin: 0;
}

.meta-cell.wide {
  grid-column: 1 / -1;
}

.meta-cell dt {
  margin: 0 0 2px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9d4a6f;
  font-weight: 600;
}

.meta-cell dd {
  margin: 0;
  font-size: 13px;
  color: #4e2a3a;
  line-height: 1.3;
}

.rating-note {
  display: inline;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 500;
  color: #9d4a6f;
}

.pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
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
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ch-label {
  color: #4e2a3a;
  font-size: 13px;
}

.ch-link {
  color: #c2185b;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  font-size: 13px;
}

.ch-link:hover {
  text-decoration: underline;
}

.empty-chapters {
  margin: 0;
  color: #74495b;
  font-size: 13px;
}

.similar-hint {
  margin: 0 0 6px;
  font-size: 12px;
  color: #74495b;
}

.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}

.similar-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.similar-link {
  display: block;
}

.similar-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #d5a2b7;
  box-shadow: 0 3px 8px rgba(90, 61, 73, 0.1);
}

.similar-title {
  font-size: 12px;
  font-weight: 700;
  color: #831843;
  text-decoration: none;
  line-height: 1.2;
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
  font-size: 10px;
  color: #7f3652;
}

.not-found {
  color: #74495b;
  font-size: 14px;
}

@media (max-width: 640px) {
  .hero {
    grid-template-columns: minmax(120px, 38vw) 1fr;
    padding: 12px;
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
    max-width: 220px;
    margin: 0 auto;
  }

  .actions {
    align-items: stretch;
  }
}
</style>
