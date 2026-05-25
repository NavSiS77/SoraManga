<template>
  <div class="auth-page">
    <section class="auth-card" aria-labelledby="auth-title">
      <header class="auth-brand">
        <RouterLink to="/" class="auth-logo">SoraManga</RouterLink>
        <p class="auth-tagline">Читай мангу с комфортом</p>
      </header>

      <div class="auth-tabs" role="tablist" aria-label="Режим авторизации">
        <button
          type="button"
          role="tab"
          class="auth-tab"
          :class="{ 'is-active': !isRegisterMode }"
          :aria-selected="!isRegisterMode"
          :disabled="authStore.isLoading"
          @click="setMode(false)"
        >
          Вход
        </button>
        <button
          type="button"
          role="tab"
          class="auth-tab"
          :class="{ 'is-active': isRegisterMode }"
          :aria-selected="isRegisterMode"
          :disabled="authStore.isLoading"
          @click="setMode(true)"
        >
          Регистрация
        </button>
      </div>

      <h1 id="auth-title" class="auth-title">
        {{ isRegisterMode ? 'Новый аккаунт' : 'С возвращением' }}
      </h1>

      <form class="auth-form" @submit.prevent="submit">
        <label class="field">
          <span class="field-label">Логин</span>
          <input
            v-model.trim="login"
            type="text"
            name="login"
            autocomplete="username"
            placeholder="Введите логин"
            required
          >
        </label>

        <label class="field">
          <span class="field-label">Пароль</span>
          <input
            v-model.trim="password"
            type="password"
            name="password"
            :autocomplete="isRegisterMode ? 'new-password' : 'current-password'"
            placeholder="Введите пароль"
            required
          >
        </label>

        <label v-if="isRegisterMode" class="field">
          <span class="field-label">Повторите пароль</span>
          <input
            v-model.trim="confirmPassword"
            type="password"
            name="confirmPassword"
            autocomplete="new-password"
            placeholder="Ещё раз пароль"
            required
          >
        </label>

        <label v-if="isRegisterMode" class="field">
          <span class="field-label">Дата рождения</span>
          <input
            v-model="birthDate"
            type="date"
            name="birthDate"
            :max="maxBirthDate"
            required
          >
        </label>
        <p v-if="isRegisterMode" class="auth-hint">
          Нужна для доступа к манге 18+. Пользователям младше 18 лет такие тайтлы недоступны.
        </p>

        <p v-if="authStore.error" class="auth-error" role="alert">
          {{ authStore.error }}
        </p>

        <button type="submit" class="btn-submit" :disabled="authStore.isLoading">
          {{
            authStore.isLoading
              ? 'Подождите...'
              : isRegisterMode
                ? 'Создать аккаунт'
                : 'Войти'
          }}
        </button>
      </form>
    </section>
  </div>
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
    const birthDate = ref('')
    const isRegisterMode = ref(false)
    const maxBirthDate = new Date().toISOString().slice(0, 10)

    const submit = async () => {
      try {
        if (isRegisterMode.value) {
          await authStore.register({
            login: login.value,
            password: password.value,
            confirmPassword: confirmPassword.value,
            birthDate: birthDate.value
          })
        } else {
          await authStore.login({
            login: login.value,
            password: password.value
          })
        }
        const redirectTo = route.query.redirect || '/profile'
        await router.push(String(redirectTo))
      } catch {
        /* ошибка отображается в store */
      }
    }

    const setMode = (register) => {
      if (isRegisterMode.value === register) {
        return
      }
      authStore.clearError()
      isRegisterMode.value = register
      confirmPassword.value = ''
      birthDate.value = ''
    }

    return {
      authStore,
      login,
      password,
      confirmPassword,
      birthDate,
      maxBirthDate,
      isRegisterMode,
      submit,
      setMode
    }
  }
}
</script>

<style scoped>
.auth-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: calc(100dvh - 62px - 44px - 36px);
  padding: 20px 0 32px;
  box-sizing: border-box;
}

.auth-page::before {
  content: '';
  position: absolute;
  top: 8%;
  right: 12%;
  width: min(220px, 40vw);
  height: min(220px, 40vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 130, 180, 0.35) 0%, transparent 70%);
  pointer-events: none;
}

.auth-page::after {
  content: '';
  position: absolute;
  bottom: 10%;
  left: 8%;
  width: min(180px, 35vw);
  height: min(180px, 35vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.22) 0%, transparent 72%);
  pointer-events: none;
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 28px 26px 24px;
  border-radius: 18px;
  border: 1px solid #f1bfd2;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 20px 50px rgba(194, 24, 91, 0.12),
    0 4px 14px rgba(78, 42, 58, 0.06);
}

@supports ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
  .auth-card {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
}

.auth-brand {
  text-align: center;
  margin-bottom: 20px;
}

.auth-logo {
  display: inline-block;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  text-decoration: none;
  color: #c2185b;
  letter-spacing: -0.02em;
}

.auth-tagline {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8e365a;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 4px;
  margin-bottom: 18px;
  border-radius: 12px;
  background: #ffe8f2;
  border: 1px solid #f5d0e0;
}

.auth-tab {
  min-height: 40px;
  padding: 0 12px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #8e365a;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.auth-tab:hover:not(:disabled):not(.is-active) {
  background: rgba(255, 255, 255, 0.55);
  color: #a73667;
}

.auth-tab.is-active {
  background: linear-gradient(135deg, #ff82b4, #ec4899);
  color: #fff;
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.22);
}

.auth-tab:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.auth-title {
  margin: 0;
  font-size: clamp(1.35rem, 4vw, 1.55rem);
  font-weight: 800;
  color: #831843;
  text-align: center;
  line-height: 1.2;
}

.auth-subtitle {
  margin: 8px 0 20px;
  font-size: 14px;
  line-height: 1.45;
  color: #7f3652;
  text-align: center;
}

.auth-form {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #8e365a;
}

.field input {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e8b8cc;
  background: #fff8fc;
  color: #4e2a3a;
  font-size: 15px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.field input::placeholder {
  color: #b8849a;
}

.field input:hover {
  border-color: #dfa0bc;
}

.field input:focus {
  outline: none;
  border-color: #ec4899;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.22);
}

.field input:-webkit-autofill,
.field input:-webkit-autofill:hover,
.field input:-webkit-autofill:focus {
  -webkit-text-fill-color: #4e2a3a;
  -webkit-box-shadow: 0 0 0 1000px #fff8fc inset;
  box-shadow: 0 0 0 1000px #fff8fc inset;
  transition: background-color 9999s ease-out 0s;
}

.auth-hint {
  margin: -4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: #8e365a;
}

.auth-error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.4;
  color: #9f1239;
  background: #fff1f2;
  border: 1px solid #fecdd3;
}

.btn-submit {
  width: 100%;
  min-height: 46px;
  margin-top: 4px;
  padding: 0 16px;
  border: 1px solid #b0154f;
  border-radius: 10px;
  background: linear-gradient(135deg, #e91e7a, #c2185b);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.1s ease;
}

.btn-submit:hover:not(:disabled) {
  filter: brightness(1.06);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-hint {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.45;
  color: #7f3652;
  background: #fff5f9;
  border: 1px dashed #efbfd3;
}

.auth-hint-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a73667;
}

.auth-hint code {
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-family: ui-monospace, Consolas, monospace;
  background: #ffe8f2;
  color: #9d174d;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 22px 18px 20px;
    border-radius: 16px;
  }

  .auth-logo {
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-tab,
  .field input,
  .btn-submit {
    transition: none;
  }
}
</style>
