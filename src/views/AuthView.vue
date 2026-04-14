<template>
  <section class="auth">
    <h1>Аутентификация</h1>
    <form @submit.prevent="submit">
      <input v-model.trim="login" type="text" placeholder="Логин" required>
      <input v-model.trim="password" type="password" placeholder="Пароль" required>
      <div class="actions">
        <button type="submit">Войти</button>
        <button type="button" @click="register">Регистрация</button>
      </div>
    </form>
    <p v-if="authStore.user">Текущий пользователь: {{ authStore.user.login }} ({{ authStore.user.role }})</p>
  </section>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'AuthView',
  setup() {
    const authStore = useAuthStore()
    const login = ref('')
    const password = ref('')

    const submit = async () => {
      await authStore.login({ login: login.value, password: password.value })
    }

    const register = async () => {
      await authStore.register({ login: login.value, password: password.value })
    }

    return { authStore, login, password, submit, register }
  }
}
</script>

<style scoped>
.auth {
  max-width: 420px;
}
form {
  display: grid;
  gap: 10px;
}
input {
  background: #0b1220;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 10px;
}
.actions {
  display: flex;
  gap: 8px;
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
