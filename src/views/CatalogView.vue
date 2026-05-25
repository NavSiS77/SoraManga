<template>
  <section class="home">
    <div class="top-tools">
      <input class="search" :value="mangaStore.searchQuery" type="text" placeholder="Поиск тайтлов..." @input="onSearch">
    </div>

    <section class="feed-block">
      <header class="block-head">
        <h2>Сейчас читают</h2>
        <RouterLink to="/profile">Смотреть избранное</RouterLink>
      </header>
      <div class="now-reading-wrap" :class="{ 'now-reading-wrap--scroll': isMobileReadingScroll }">
        <button
          v-if="!isMobileReadingScroll"
          class="carousel-arrow left"
          type="button"
          @click="scrollNowReading('left')"
          aria-label="Прокрутить влево"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 7 9 12l5 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <Transition v-if="!isMobileReadingScroll" name="cards-fade" mode="out-in">
          <div class="row-cards row-cards--grid" :key="nowReadingPage">
            <article v-for="card in visibleNowReading" :key="card.id" class="cover-card">
              <RouterLink :to="`/manga/${card.id}`" class="cover-link">
                <img class="cover" :src="card.coverUrl" :alt="card.title" loading="lazy" decoding="async" referrerpolicy="no-referrer">
              </RouterLink>
              <h4>{{ card.title }}</h4>
              <p>{{ getGenreNames(card.genres) }}</p>
              <p class="meta">
                <AgeRatingBadge :manga-id="card.id" :age-rating="card.ageRating" />
                <span class="status" :class="card.status === 'COMPLETED' ? 'completed' : 'ongoing'">
                  {{ card.status === 'COMPLETED' ? 'Завершен' : 'Онгоинг' }}
                </span>
                <span>{{ card.rating?.toFixed(2) || '0.00' }} / 10</span>
              </p>
              <button
                class="fav-btn"
                :class="{ 'is-favorite': mangaStore.isFavorite(card.id) }"
                @click="mangaStore.toggleFavorite(card.id)"
              >
                {{ mangaStore.isFavorite(card.id) ? 'Убрать из избранного' : 'В избранное' }}
              </button>
            </article>
          </div>
        </Transition>
        <div v-else class="row-cards row-cards--scroll">
          <article v-for="card in nowReading" :key="card.id" class="cover-card">
            <RouterLink :to="`/manga/${card.id}`" class="cover-link">
              <img class="cover" :src="card.coverUrl" :alt="card.title" loading="lazy" decoding="async" referrerpolicy="no-referrer">
            </RouterLink>
            <h4>{{ card.title }}</h4>
            <p>{{ getGenreNames(card.genres) }}</p>
            <p class="meta">
              <AgeRatingBadge :manga-id="card.id" :age-rating="card.ageRating" />
              <span class="status" :class="card.status === 'COMPLETED' ? 'completed' : 'ongoing'">
                {{ card.status === 'COMPLETED' ? 'Завершен' : 'Онгоинг' }}
              </span>
              <span>{{ card.rating?.toFixed(2) || '0.00' }} / 10</span>
            </p>
            <button
              class="fav-btn"
              :class="{ 'is-favorite': mangaStore.isFavorite(card.id) }"
              @click="mangaStore.toggleFavorite(card.id)"
            >
              {{ mangaStore.isFavorite(card.id) ? 'Убрать из избранного' : 'В избранное' }}
            </button>
          </article>
        </div>
        <button
          v-if="!isMobileReadingScroll"
          class="carousel-arrow right"
          type="button"
          @click="scrollNowReading('right')"
          aria-label="Прокрутить вправо"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </section>

    <section class="feed-block">
      <header class="block-head">
        <h2>Каталог</h2>
      </header>
      <div class="catalog-grid">
        <article v-for="card in catalogPreview" :key="`catalog-${card.id}`" class="catalog-card">
          <RouterLink :to="`/manga/${card.id}`" class="cover-link">
            <img class="cover" :src="card.coverUrl" :alt="card.title" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          </RouterLink>
          <h4>{{ card.title }}</h4>
          <p>{{ getGenreNames(card.genres) }}</p>
          <p class="meta">
            <AgeRatingBadge :manga-id="card.id" :age-rating="card.ageRating" />
          </p>
        </article>
      </div>
      <div class="catalog-more-wrap">
        <RouterLink class="catalog-more-btn" to="/catalog">Смотреть больше</RouterLink>
      </div>
    </section>

    <section class="feed-block">
      <header class="block-head">
        <h2>Топ-30 манги по рейтингу</h2>
      </header>
      <ol class="top-list">
        <li v-for="item in visibleTopRated" :key="item.id" class="top-item">
          <span class="place">#{{ item.rank }}</span>
          <RouterLink class="top-title" :to="`/manga/${item.id}`">{{ item.title }}</RouterLink>
          <span class="score">{{ item.rating.toFixed(2) }}</span>
        </li>
      </ol>
      <button class="expand-btn" type="button" @click="isTopExpanded = !isTopExpanded">
        {{ isTopExpanded ? 'Свернуть список' : 'Показать все' }}
      </button>
    </section>

    <p v-if="!mangaStore.mangaList.length">По вашему запросу ничего не найдено.</p>
  </section>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMangaStore } from '../stores/manga'
import AgeRatingBadge from '../components/AgeRatingBadge.vue'

export default {
  name: 'CatalogView',
  components: { AgeRatingBadge },
  setup() {
    const mangaStore = useMangaStore()
    const isTopExpanded = ref(false)
    const nowReading = computed(() => mangaStore.sortedManga.slice(0, 15))
    const catalogPreview = computed(() => mangaStore.sortedManga.slice(0, 10))
    const visibleTopRated = computed(() => {
      return isTopExpanded.value
        ? mangaStore.topRated30
        : mangaStore.topRated30.slice(0, 5)
    })

    const nowReadingPage = ref(0)
    const pageSize = 5
    const totalPages = computed(() => Math.max(1, Math.ceil(nowReading.value.length / pageSize)))
    const visibleNowReading = computed(() => {
      const start = nowReadingPage.value * pageSize
      return nowReading.value.slice(start, start + pageSize)
    })
    const isMobileReadingScroll = ref(false)
    let readingScrollMedia = null
    const syncReadingScrollLayout = () => {
      isMobileReadingScroll.value = readingScrollMedia?.matches ?? false
    }
    const scrollNowReading = (direction) => {
      if (direction === 'left') {
        nowReadingPage.value = (nowReadingPage.value - 1 + totalPages.value) % totalPages.value
      } else {
        nowReadingPage.value = (nowReadingPage.value + 1) % totalPages.value
      }
    }
    const onSearch = (event) => {
      mangaStore.search(event.target.value)
    }
    const getGenreNames = (genreIds) => {
      return mangaStore.genres
        .filter((genre) => genreIds.includes(genre.id))
        .map((genre) => genre.name)
        .join(', ')
    }

    onMounted(async () => {
      readingScrollMedia = window.matchMedia('(max-width: 760px)')
      syncReadingScrollLayout()
      readingScrollMedia.addEventListener('change', syncReadingScrollLayout)
      await mangaStore.fetchGenres()
      await mangaStore.fetchCatalog()
    })

    onUnmounted(() => {
      readingScrollMedia?.removeEventListener('change', syncReadingScrollLayout)
    })

    return {
      mangaStore,
      isTopExpanded,
      isMobileReadingScroll,
      nowReading,
      nowReadingPage,
      visibleNowReading,
      catalogPreview,
      visibleTopRated,
      scrollNowReading,
      onSearch,
      getGenreNames
    }
  }
}
</script>

<style scoped>
.home {
  display: grid;
  gap: 10px;
  font-family: 'Segoe UI', Arial, sans-serif;
  min-width: 0;
}

.top-tools {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 6px;
}

.tab {
  border: 1px solid #efbfd3;
  background: #ffffffb8;
  color: #7f3652;
  border-radius: 999px;
  font-size: 13px;
  min-height: 34px;
  padding: 0 12px;
  cursor: pointer;
}

.tab.active {
  color: #fff;
  background: linear-gradient(135deg, #ff82b4, #ff5e9a);
}

.search {
  min-width: 0;
  width: 100%;
  max-width: 240px;
  border-radius: 999px;
  border: 1px solid #efbfd3;
  background: #ffffffb8;
  font-size: 13px;
  min-height: 36px;
  padding: 0 12px;
  color: #5a2b3e;
}

.glass {
  border-radius: 14px;
  border: 1px solid #20202033;
  background: linear-gradient(150deg, #ffffffdd 0%, #ffe3f0b8 100%);
  box-shadow: 0 14px 24px rgba(153, 73, 110, 0.12);
  padding: 12px;
}

.promo {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(145deg, #fff, #ffe5f1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
}

.promo h3 {
  margin: 0 0 2px;
  font-size: 19px;
  line-height: 1.2;
  letter-spacing: normal;
  word-spacing: normal;
  font-weight: 700;
  font-stretch: normal;
}

.promo p {
  margin: 0;
  font-size: 14px;
  line-height: 1.3;
  color: #74495b;
  letter-spacing: normal;
  word-spacing: normal;
  font-stretch: normal;
}

.promo button {
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: #212121;
  color: #fff;
  cursor: pointer;
}

.feed-block {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffffdd 0%, #ffe3f0a8 100%);
  padding: 10px;
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-head h2 {
  margin: 0;
  font-size: clamp(17px, 1.4vw, 20px);
  line-height: 1.2;
}

.block-head a {
  color: #a73667;
  text-decoration: none;
}

.now-reading-wrap {
  position: relative;
  margin-top: 8px;
  min-width: 0;
  overflow: hidden;
  padding-inline: 38px;
}

.now-reading-wrap--scroll {
  padding-inline: 0;
  overflow: visible;
}

.row-cards {
  width: 100%;
  max-width: 100%;
  margin-top: 0;
}

.row-cards--grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  overflow: hidden;
  padding-bottom: 2px;
}

.row-cards--scroll {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 12px;
  padding: 2px 4px 12px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scroll-padding-inline: 8px;
  touch-action: pan-x;
  scrollbar-width: thin;
  scrollbar-color: #e8a4c0 #fff0f6;
}

.row-cards--scroll::-webkit-scrollbar {
  height: 5px;
}

.row-cards--scroll::-webkit-scrollbar-thumb {
  background: #e8a4c0;
  border-radius: 999px;
}

.row-cards--scroll .cover-card {
  flex: 0 0 min(44vw, 180px);
  width: min(44vw, 180px);
  max-width: none;
  scroll-snap-align: start;
}

.carousel-arrow {
  position: absolute;
  top: 44%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #f3b7d0;
  background: linear-gradient(145deg, #ffffff, #ffe2ef);
  color: #9d2a60;
  cursor: pointer;
  z-index: 2;
  touch-action: manipulation;
  box-shadow: 0 8px 16px rgba(167, 54, 103, 0.2);
  transition: transform 0.18s ease, box-shadow 0.22s ease, background 0.22s ease;
  padding: 0;
}

.carousel-arrow:hover {
  background: linear-gradient(145deg, #fff7fb, #ffd5e7);
  box-shadow: 0 10px 18px rgba(167, 54, 103, 0.28);
}

.carousel-arrow:active {
  transform: translateY(-50%) scale(0.95);
  box-shadow: 0 4px 10px rgba(167, 54, 103, 0.2);
}

.carousel-arrow.left {
  left: 4px;
}

.carousel-arrow.right {
  right: 4px;
}

.cards-fade-enter-active,
.cards-fade-leave-active {
  transition: opacity 260ms ease, transform 260ms ease;
}

.cards-fade-enter-from,
.cards-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.cover-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0 4px;
  gap: 0;
}

.cover-link {
  display: block;
}

.cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  height: auto;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #d5a2b7;
  box-shadow: 0 6px 10px rgba(90, 61, 73, 0.14);
}

.cover-card h4 {
  margin: 8px 0 0;
  font-size: clamp(12px, 1.2vw, 14px);
  line-height: 1.25;
  color: #831843;
  font-weight: 700;
}

.cover-card > p:not(.meta) {
  margin: 4px 0 0;
  color: #5f4a53;
  font-size: clamp(10px, 1.1vw, 12px);
  line-height: 1.3;
}

.meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}
.status {
  font-size: 10px;
  font-weight: 700;
  height: 22px;
  min-width: 52px;
  padding: 0 8px;
  border-radius: 999px;
  color: #fff;
  white-space: nowrap;
}
.status.ongoing {
  background: #f97316;
}
.status.completed {
  background: #22c55e;
}
.top-list {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
}
.catalog-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}
.catalog-card {
  min-width: 0;
}
.top-item {
  display: grid;
  grid-template-columns: 54px 1fr 56px;
  align-items: center;
  gap: 8px;
  border: 1px solid #efbfd3;
  border-radius: 10px;
  padding: 8px 10px;
  background: #fff8fc;
}

.top-title {
  color: #4e2a3a;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-title:hover {
  color: #c2185b;
}

.expand-btn {
  display: block;
  margin-top: 18px;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #efbfd3;
  border-radius: 10px;
  min-height: 38px;
  padding: 0 14px;
  background: #ffffffb8;
  color: #7f3652;
  cursor: pointer;
}
.catalog-more-btn {
  border: 1px solid #efbfd3;
  border-radius: 8px;
  min-height: 34px;
  padding: 0 12px;
  background: #ffffffb8;
  color: #7f3652;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
}
.catalog-more-wrap {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
.place {
  font-weight: 700;
  color: #a73667;
}
.score {
  text-align: right;
  font-weight: 700;
  color: #7f3652;
  white-space: nowrap;
}
.fav-btn {
  margin-top: 10px;
  width: 100%;
  border: 1px solid #efbfd3;
  background: #ffffffb8;
  border-radius: 8px;
  min-height: 36px;
  padding: 0 10px;
  cursor: pointer;
  color: #7f3652;
  font-weight: 600;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.fav-btn.is-favorite {
  background: linear-gradient(135deg, #ff82b4, #e91e7a);
  color: #fff;
  border-color: #db2777;
  box-shadow: 0 3px 10px rgba(236, 72, 153, 0.3);
}

.fav-btn.is-favorite:hover {
  filter: brightness(1.04);
}

@media (max-width: 760px) {
  .top-tools {
    justify-content: stretch;
  }
  .search {
    min-width: 0;
    max-width: none;
  }
  .promo {
    flex-direction: column;
    align-items: flex-start;
  }
  .catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding-inline: 0;
  }

  .row-cards--scroll {
    gap: 10px;
  }

  .row-cards--scroll .cover-card {
    flex-basis: min(46vw, 160px);
    width: min(46vw, 160px);
  }

  .promo button {
    width: 100%;
  }

  .top-item {
    grid-template-columns: 42px minmax(0, 1fr) auto;
    gap: 6px;
    padding: 8px;
  }

  .place {
    font-size: 14px;
  }

  .top-title {
    font-size: 14px;
  }

  .score {
    font-size: 14px;
    padding-left: 4px;
  }

  .block-head {
    gap: 10px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .top-item {
    grid-template-columns: 38px minmax(0, 1fr) auto;
    gap: 5px;
    padding: 7px 8px;
  }

  .place {
    font-size: 13px;
  }

  .top-title {
    font-size: 13px;
  }

  .score {
    font-size: 13px;
  }

  .catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .row-cards--scroll {
    gap: 8px;
    padding-bottom: 10px;
  }

  .cover-card {
    padding: 0 2px;
  }

  .row-cards--scroll .cover-card h4,
  .cover-card h4,
  .catalog-card h4 {
    margin: 6px 0 0;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  .cover-card > p:not(.meta),
  .catalog-card p {
    margin-top: 2px;
    font-size: 9px;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    margin-top: 6px;
    flex-wrap: wrap;
    gap: 4px;
  }

  .status {
    font-size: 8px;
    height: 18px;
    min-width: 44px;
    padding: 0 5px;
  }

  .meta > span:last-child {
    font-size: 9px;
  }

  .fav-btn {
    margin-top: 6px;
    min-height: 32px;
    padding: 0 6px;
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .promo {
    padding: 12px;
  }

  .feed-block {
    padding: 12px;
  }
}

@media (min-width: 1200px) {
  .row-cards--grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
