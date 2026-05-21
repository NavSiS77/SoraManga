<template>
  <section
    class="ratings-card"
    :class="{ 'ratings-card--compact': compact }"
    :aria-label="'Оценки пользователей для ' + title"
  >
    <header class="ratings-head">
      <h2 class="ratings-title">Оценки пользователей</h2>
      <div class="ratings-avg">
        <span class="star-gold" aria-hidden="true">★</span>
        <span class="avg-num">{{ meanFormatted }}</span>
        <span class="avg-total">{{ totalFormatted }}</span>
      </div>
    </header>

    <div class="vote-row">
      <span class="vote-label">Ваша оценка</span>
      <div class="stars" role="group" aria-label="Выбор оценки от 1 до 10">
        <button
          v-for="s in 10"
          :key="s"
          type="button"
          class="star-btn"
          :class="{ active: summary.userStars === s }"
          :aria-pressed="summary.userStars === s"
          :aria-label="String(s)"
          @click="vote(s)"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <ul class="rows">
      <li v-for="row in summary.rows" :key="row.star" class="row">
        <div class="row-left">
          <span class="row-num">{{ row.star }}</span>
          <span class="row-star" aria-hidden="true">★</span>
        </div>
        <div class="bar-wrap" :title="`${row.pct.toFixed(1)}%`">
          <div
            class="bar-fill"
            :style="{ width: row.pct + '%', background: barColor(row.star) }"
          />
        </div>
        <span class="pct">{{ row.pct.toFixed(1) }}%</span>
        <span class="cnt">{{ formatInt(row.count) }}</span>
      </li>
    </ul>
    <p class="hint">
      Распределение строится вокруг ориентира
      <a href="https://shikimori.io/mangas?order=popularity" target="_blank" rel="noopener noreferrer">Shikimori</a>;
      ваш голос сразу учитывается в сумме.
    </p>
  </section>
</template>

<script>
import { computed, watch } from 'vue'
import { useMangaUserRatingsStore } from '../stores/mangaUserRatings'
import { barColorForStar } from '../utils/mangaRatingBuckets'

export default {
  name: 'MangaUserRatings',
  props: {
    mangaId: { type: Number, required: true },
    /** Среднее значение (ориентир Shikimori), 1–10 */
    baseMean: { type: Number, required: true },
    title: { type: String, default: '' },
    compact: { type: Boolean, default: false }
  },
  setup(props) {
    const store = useMangaUserRatingsStore()

    watch(
      () => [props.mangaId, props.baseMean],
      () => {
        store.ensureManga(props.mangaId, props.baseMean)
      },
      { immediate: true }
    )

    const summary = computed(() => store.getSummary(props.mangaId, props.baseMean))

    const meanFormatted = computed(() => summary.value.mean.toFixed(2))

    const totalFormatted = computed(() => {
      const n = summary.value.total
      if (n >= 1000) {
        return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)} K`
      }
      return String(n)
    })

    const vote = (stars) => {
      store.setUserVote(props.mangaId, stars, props.baseMean)
    }

    const barColor = (star) => barColorForStar(star)

    const formatInt = (n) => new Intl.NumberFormat('ru-RU').format(n)

    return { summary, meanFormatted, totalFormatted, vote, barColor, formatInt }
  }
}
</script>

<style scoped>
.ratings-card {
  border-radius: 14px;
  padding: 14px 16px;
  background: linear-gradient(165deg, #2a1f35 0%, #1e1628 50%, #15111c 100%);
  color: #f8e9f2;
  border: 1px solid #3d2a35;
  box-shadow: 0 10px 24px rgba(40, 20, 35, 0.28);
}

.ratings-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.ratings-title {
  margin: 0;
  flex: 1 1 auto;
  min-width: 10rem;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.25;
}

.ratings-avg {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.22);
  font-weight: 700;
}

.star-gold {
  color: #fbbf24;
  font-size: 1.25rem;
  line-height: 1;
}

.avg-num {
  font-size: 1.35rem;
}

.avg-total {
  font-size: 0.85rem;
  color: #c4a8b8;
  font-weight: 600;
}

.vote-row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px 14px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3d2a35;
}

.vote-label {
  font-size: 14px;
  font-weight: 600;
  color: #d8b8c8;
  white-space: nowrap;
}

.stars {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.star-btn {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #5c4152;
  background: #2d1f28;
  color: #e9d4df;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
}

.star-btn:hover {
  border-color: #f472b6;
  color: #fff;
}

.star-btn.active {
  background: linear-gradient(135deg, #ff82b4, #ec4899);
  border-color: #fbcfe8;
  color: #fff;
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(5, auto);
  grid-auto-flow: column;
  column-gap: 20px;
  row-gap: 5px;
}

@media (max-width: 560px) {
  .rows {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-auto-flow: row;
  }
}

.row {
  display: grid;
  grid-template-columns: 48px 1fr 52px 56px;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e9d4df;
}

.row-num {
  width: 18px;
  text-align: right;
  font-weight: 700;
}

.row-star {
  color: #7c6a72;
  font-size: 12px;
}

.bar-wrap {
  height: 8px;
  border-radius: 999px;
  background: #3a2a32;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  min-width: 0;
  transition: width 0.25s ease;
}

.pct {
  text-align: right;
  color: #d8b8c8;
  font-variant-numeric: tabular-nums;
}

.cnt {
  text-align: right;
  color: #b89aaa;
  font-variant-numeric: tabular-nums;
}

.hint {
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 1.35;
  color: #9a7d8c;
}

.hint a {
  color: #f9a8d4;
}

.hint a:hover {
  text-decoration: underline;
}

.ratings-card--compact {
  padding: 10px 12px;
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(40, 20, 35, 0.28);
}

.ratings-card--compact .ratings-head {
  margin-bottom: 8px;
  gap: 8px;
}

.ratings-card--compact .ratings-title {
  font-size: 0.92rem;
}

.ratings-card--compact .star-gold {
  font-size: 1.05rem;
}

.ratings-card--compact .avg-num {
  font-size: 1.12rem;
}

.ratings-card--compact .vote-row {
  margin-bottom: 8px;
  padding-bottom: 8px;
  gap: 6px;
}

.ratings-card--compact .vote-label {
  font-size: 12px;
}

.ratings-card--compact .stars {
  gap: 3px;
}

.ratings-card--compact .star-btn {
  width: 26px;
  height: 26px;
  font-size: 11px;
  border-radius: 6px;
}

.ratings-card--compact .rows {
  gap: 3px;
}

.ratings-card--compact .row {
  grid-template-columns: 44px 1fr 44px 50px;
  gap: 5px;
  font-size: 11px;
}

.ratings-card--compact .bar-wrap {
  height: 6px;
}

.ratings-card--compact .hint {
  margin-top: 6px;
  font-size: 10px;
}

@media (max-width: 520px) {
  .vote-row {
    grid-template-columns: 1fr;
  }

  .vote-label {
    margin-bottom: 2px;
  }
}
</style>
