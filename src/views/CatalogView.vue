<template>
  <section class="home">
    <div class="top-tools">
      <input class="search" :value="mangaStore.searchQuery" type="text" placeholder="Поиск тайтлов..." @input="onSearch">
    </div>

    <article class="promo">
      <div>
        <h3>Твой список чтения в SoraManga</h3>
        <p>Сохраняй прогресс, добавляй тайтлы в избранное и получай рекомендации.</p>
      </div>
      <button>Подписаться</button>
    </article>

    <section class="feed-block">
      <header class="block-head">
        <h2>Сейчас читают</h2>
        <RouterLink to="/profile">Смотреть избранное</RouterLink>
      </header>
      <div class="carousel-wrap">
        <button class="carousel-arrow left" type="button" @click="scrollNowReading('left')" aria-label="Прокрутить влево">
          <span>‹</span>
        </button>
        <Transition name="cards-fade" mode="out-in">
          <div class="row-cards" :key="nowReadingPage">
            <article v-for="card in visibleNowReading" :key="card.id" class="cover-card">
              <RouterLink :to="`/manga/${card.id}`" class="cover-link">
                <img class="cover" :src="card.coverUrl" :alt="card.title" loading="lazy" decoding="async">
              </RouterLink>
              <h4>{{ card.title }}</h4>
              <p>{{ getGenreNames(card.genres) }}</p>
              <p class="meta">
                <span class="status" :class="card.status === 'COMPLETED' ? 'completed' : 'ongoing'">
                  {{ card.status === 'COMPLETED' ? 'Завершен' : 'Онгоинг' }}
                </span>
                <span>{{ card.rating?.toFixed(1) || '0.0' }} / 10</span>
              </p>
              <button class="fav-btn" @click="mangaStore.toggleFavorite(card.id)">
                {{ mangaStore.isFavorite(card.id) ? 'Убрать из избранного' : 'В избранное' }}
              </button>
            </article>
          </div>
        </Transition>
        <button class="carousel-arrow right" type="button" @click="scrollNowReading('right')" aria-label="Прокрутить вправо">
          <span>›</span>
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
            <img class="cover" :src="card.coverUrl" :alt="card.title" loading="lazy" decoding="async">
          </RouterLink>
          <h4>{{ card.title }}</h4>
          <p>{{ getGenreNames(card.genres) }}</p>
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
          <RouterLink :to="`/manga/${item.id}`">{{ item.title }}</RouterLink>
          <span class="score">{{ item.rating.toFixed(1) }}</span>
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
import { computed, onMounted, ref } from 'vue'
import { useMangaStore } from '../stores/manga'

export default {
  name: 'CatalogView',
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
      await mangaStore.fetchGenres()
      await mangaStore.fetchCatalog()
    })

    return {
      mangaStore,
      isTopExpanded,
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
  padding: 6px 10px;
  line-height: 1.2;
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
  line-height: 1.2;
  padding: 8px 12px;
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
  border: none;
  border-radius: 10px;
  background: #212121;
  color: #fff;
  font-size: 13px;
  line-height: 1.2;
  padding: 8px 12px;
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

.carousel-wrap {
  position: relative;
  margin-top: 8px;
  min-width: 0;
  overflow: hidden;
  padding-inline: 38px;
}

.row-cards {
  margin-top: 8px;
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  overflow: hidden;
  padding-bottom: 2px;
}

.cover-card {
  min-width: 0;
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
  margin: 6px 0 2px;
  font-size: clamp(12px, 1.2vw, 14px);
  line-height: 1.2;
}

.cover-card p {
  margin: 0;
  color: #5f4a53;
  font-size: clamp(10px, 1.1vw, 12px);
  line-height: 1.2;
}
.meta {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}
.status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  color: #fff;
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
.expand-btn {
  display: block;
  margin-top: 10px;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #efbfd3;
  border-radius: 10px;
  padding: 8px 12px;
  background: #ffffffb8;
  color: #7f3652;
  cursor: pointer;
}
.catalog-more-btn {
  display: inline-block;
  border: 1px solid #efbfd3;
  border-radius: 8px;
  padding: 5px 9px;
  background: #ffffffb8;
  color: #7f3652;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  line-height: 1.2;
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
}
.fav-btn {
  margin-top: 8px;
  border: 1px solid #efbfd3;
  background: #ffffffb8;
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  color: #7f3652;
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
  display: grid;
  place-items: center;
  padding: 0;
}
.carousel-arrow span {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 24px;
  line-height: 1;
  transform: translateY(-3.5px);
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
  .row-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-inline: 2px;
  }
  .cover-card {
    flex-basis: 62vw;
    min-width: 62vw;
  }
  .carousel-arrow {
    width: 34px;
    height: 34px;
    top: 43%;
  }
  .carousel-arrow.left {
    left: 2px;
  }
  .carousel-arrow.right {
    right: 2px;
  }
  .top-item {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "title score"
      "place place";
    gap: 6px;
  }
  .top-item .place {
    grid-area: place;
  }
  .top-item a {
    grid-area: title;
  }
  .top-item .score {
    grid-area: score;
  }
  .catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .block-head {
    gap: 10px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 420px) {
  .carousel-wrap {
    padding-inline: 0;
  }
  .row-cards {
    grid-template-columns: 1fr;
  }
  .catalog-grid {
    grid-template-columns: 1fr;
  }
  .carousel-arrow {
    display: none;
  }
}

@media (min-width: 1200px) {
  .row-cards {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
