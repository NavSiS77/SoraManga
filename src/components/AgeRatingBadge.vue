<template>
  <span
    v-if="label"
    class="age-badge"
    :class="{ 'age-badge--adult': isAdult }"
    :title="title"
  >
    {{ label }}
  </span>
</template>

<script>
import { computed } from 'vue'
import { getAgeRatingLabel, getShikimoriAgeRating } from '../utils/ageRestriction'

export default {
  name: 'AgeRatingBadge',
  props: {
    mangaId: { type: [Number, String], default: null },
    ageRating: { type: String, default: '' }
  },
  setup(props) {
    const rating = computed(() => props.ageRating || getShikimoriAgeRating(props.mangaId))
    const label = computed(() => getAgeRatingLabel(rating.value))
    const isAdult = computed(() => rating.value === 'rx')
    const title = computed(() =>
      isAdult.value
        ? 'Манга 18+. Доступно только пользователям старше 18 лет.'
        : `Возрастное ограничение по Shikimori: ${label.value}`
    )
    return { label, isAdult, title }
  }
}
</script>

<style scoped>
.age-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #7f3652;
  background: #fce7f3;
  border: 1px solid #f3b7d0;
  white-space: nowrap;
}

.age-badge--adult {
  color: #fff;
  background: linear-gradient(135deg, #dc2626, #9f1239);
  border-color: #991b1b;
}
</style>
