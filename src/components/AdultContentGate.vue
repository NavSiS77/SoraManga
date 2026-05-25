<template>
  <div class="adult-gate" role="alert">
    <p class="adult-gate-icon" aria-hidden="true">18+</p>
    <h2 class="adult-gate-title">Доступ ограничен</h2>
    <p class="adult-gate-text">{{ message }}</p>
    <p v-if="mangaTitle" class="adult-gate-manga">«{{ mangaTitle }}» — манга с возрастным ограничением 18+.</p>
    <div class="adult-gate-actions">
      <RouterLink class="btn btn-primary" to="/catalog">В каталог</RouterLink>
      <RouterLink v-if="!authStore.user" class="btn btn-ghost" to="/auth">Войти</RouterLink>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'AdultContentGate',
  props: {
    message: { type: String, required: true },
    mangaTitle: { type: String, default: '' }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  }
}
</script>

<style scoped>
.adult-gate {
  margin: 16px 0;
  padding: 20px 18px;
  border-radius: 14px;
  border: 1px solid #fecaca;
  background: linear-gradient(150deg, #fff5f5 0%, #ffe4e6 100%);
  text-align: center;
}

.adult-gate-icon {
  margin: 0 auto 8px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #9f1239);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
}

.adult-gate-title {
  margin: 0 0 8px;
  font-size: 1.15rem;
  color: #831843;
}

.adult-gate-text,
.adult-gate-manga {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.45;
  color: #5a2b3e;
}

.adult-gate-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #ff82b4, #ec4899);
}

.btn-ghost {
  color: #7f3652;
  background: #fff8fc;
  border: 1px solid #efbfd3;
}
</style>
