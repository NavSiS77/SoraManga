<template>
  <section>
    <h1>Личный кабинет</h1>
    <div v-if="authStore.user" class="card">
      <p><strong>Логин:</strong> {{ authStore.user.login }}</p>
      <p><strong>Роль:</strong> {{ authStore.user.role }}</p>
      <button @click="authStore.logout()">Выйти</button>
    </div>
    <p v-else>Вы не авторизованы. Перейдите на страницу входа.</p>
  </section>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ProfileView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  }
}
</script>

<style scoped>
.card {
  max-width: 420px;
  background: #111827;
  border: 1px solid #1f2937;
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
}
</style>
