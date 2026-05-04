<template>
  <section class="auth">
    <h1>{{ isRegisterMode ? 'Регистрация' : 'Вход' }}</h1>
    <p class="hint">Для администратора: логин `admin`, пароль `admin123`.</p>
    <form @submit.prevent="submit">
      <input v-model.trim="login" type="text" placeholder="Логин" required>
      <input v-model.trim="password" type="password" placeholder="Пароль" required>
      <input
        v-if="isRegisterMode"
        v-model.trim="confirmPassword"
        type="password"
        placeholder="Повторите пароль"
        required
      >
      <div class="actions">
        <button type="submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Подождите...' : (isRegisterMode ? 'Создать аккаунт' : 'Войти') }}
        </button>
        <button type="button" class="secondary" :disabled="authStore.isLoading" @click="toggleMode">
          {{ isRegisterMode ? 'У меня уже есть аккаунт' : 'Создать новый аккаунт' }}
        </button>
      </div>
    </form>
    <p class="error" v-if="authStore.error">{{ authStore.error }}</p>
    <p v-if="authStore.user">Текущий пользователь: {{ authStore.user.login }} ({{ authStore.user.role }})</p>
  </section>
</template>

<script>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'AuthView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const route = useRoute()
    const login = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const isRegisterMode = ref(false)

    const submit = async () => {
      try {
        if (isRegisterMode.value) {
          await authStore.register({
            login: login.value,
            password: password.value,
            confirmPassword: confirmPassword.value
          })
        } else {
          await authStore.login({
            login: login.value,
            password: password.value
          })
        }
        const redirectTo = route.query.redirect || '/profile'
        await router.push(String(redirectTo))
      } catch (error) {
        // Ошибка уже сохранена в store для отображения пользователю.
      }
    }

    const toggleMode = () => {
      authStore.clearError()
      isRegisterMode.value = !isRegisterMode.value
      confirmPassword.value = ''
    }

    return {
      authStore,
      login,
      password,
      confirmPassword,
      isRegisterMode,
      submit,
      toggleMode
    }
  }
}
</script>

<style scoped>
.auth {
  width: 100%;
  max-width: 460px;
  min-width: 0;
}
.hint {
  color: #74495b;
  font-size: 13px;
}
form {
  display: grid;
  gap: 10px;
}
input {
  background: #fff;
  border: 1px solid #d8b6c6;
  color: #4e2a3a;
  border-radius: 8px;
  min-height: 42px;
  padding: 10px 12px;
  width: 100%;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
button {
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  min-height: 40px;
}
.secondary {
  background: #6b7280;
}
.error {
  color: #dc2626;
  margin-top: 10px;
}
@media (max-width: 480px) {
  .auth h1 {
    font-size: 24px;
  }
  .actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
