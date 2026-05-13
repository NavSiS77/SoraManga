<template>
  <section class="catalog-page">
    <header class="page-head">
      <h1>Все тайтлы</h1>
      <RouterLink to="/">На главную</RouterLink>
    </header>

    <div class="filters">
      <select class="control" :value="selectedGenre || ''" @change="onGenreChange">
        <option value="">Все жанры</option>
        <option v-for="genre in mangaStore.genres" :key="genre.id" :value="genre.id">
          {{ genre.name }}
        </option>
      </select>
      <select class="control" :value="sortBy" @change="onSortChange">
        <option value="popular">Сначала популярные</option>
        <option value="rating">По рейтингу</option>
        <option value="newest">Сначала новые</option>
        <option value="title-asc">По названию (А-Я)</option>
        <option value="title-desc">По названию (Я-А)</option>
      </select>
    </div>

    <p class="count">Всего в каталоге: {{ filteredCatalog.length }}</p>

    <div class="catalog-grid">
      <article v-for="item in filteredCatalog" :key="item.id" class="catalog-card">
        <RouterLink :to="`/manga/${item.id}`" class="cover-link">
          <img class="cover" :src="item.coverUrl" :alt="item.title" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        </RouterLink>
        <h4>{{ item.title }}</h4>
        <p>{{ getGenreNames(item.genres) }}</p>
        <p class="meta">{{ item.rating?.toFixed(2) || '0.00' }} / 10</p>
      </article>
    </div>
  </section>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useMangaStore } from '../stores/manga'
import { MangaApi } from '../services/mangaApi'
import { getShikimoriPopularityRank } from '../data/shikimoriScores'

export default {
  name: 'AllCatalogView',
  setup() {
    const mangaStore = useMangaStore()
    const selectedGenre = ref(null)
    const sortBy = ref('popular')

    const getGenreNames = (genreIds) => {
      return mangaStore.genres
        .filter((genre) => genreIds.includes(genre.id))
        .map((genre) => genre.name)
        .join(', ')
    }
    const filteredCatalog = computed(() => {
      const genreFiltered = selectedGenre.value
        ? mangaStore.mangaList.filter((item) => item.genres.includes(selectedGenre.value))
        : [...mangaStore.mangaList]

      if (sortBy.value === 'title-asc') {
        return genreFiltered.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      }
      if (sortBy.value === 'title-desc') {
        return genreFiltered.sort((a, b) => b.title.localeCompare(a.title, 'ru'))
      }
      if (sortBy.value === 'newest') {
        return genreFiltered.sort((a, b) => b.id - a.id)
      }
      if (sortBy.value === 'rating') {
        return genreFiltered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      }
      return genreFiltered.sort((a, b) => {
        const ra = a.popularityRank ?? getShikimoriPopularityRank(a.id)
        const rb = b.popularityRank ?? getShikimoriPopularityRank(b.id)
        if (ra !== rb) {
          return ra - rb
        }
        return (b.rating || 0) - (a.rating || 0)
      })
    })

    const onGenreChange = (event) => {
      selectedGenre.value = event.target.value ? Number(event.target.value) : null
    }
    const onSortChange = (event) => {
      sortBy.value = event.target.value || 'popular'
    }

    onMounted(async () => {
      await mangaStore.fetchGenres()
      mangaStore.mangaList = await MangaApi.getCatalog({ searchQuery: '', genreId: null })
    })

    return { mangaStore, selectedGenre, sortBy, filteredCatalog, getGenreNames, onGenreChange, onSortChange }
  }
}
</script>

<style scoped>
.catalog-page {
  display: grid;
  gap: 10px;
}
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.page-head a {
  text-decoration: none;
  color: #a73667;
}
.count {
  margin: 0;
  color: #7f3652;
}
.filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.control {
  min-width: 0;
  width: 100%;
  border-radius: 999px;
  border: 1px solid #efbfd3;
  background: #ffffffb8;
  padding: 8px 12px;
  color: #5a2b3e;
}
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}
.catalog-card {
  min-width: 0;
}
.cover-link {
  display: block;
}
.cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #d5a2b7;
}
h4 {
  margin: 6px 0 2px;
  font-size: 13px;
}
p {
  margin: 0;
  font-size: 11px;
  color: #5f4a53;
}
.meta {
  margin-top: 4px;
  font-weight: 700;
}
@media (max-width: 960px) {
  .catalog-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .filters {
    grid-template-columns: 1fr;
  }
  .catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
