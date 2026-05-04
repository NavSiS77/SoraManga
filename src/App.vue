<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <div class="brand-group">
          <RouterLink to="/" class="logo">SoraManga</RouterLink>
          <p class="tagline">Manga reader platform</p>
        </div>
        <nav class="navbar">
          <RouterLink v-if="!authStore.isAuthenticated" to="/auth">Вход / Регистрация</RouterLink>
          <RouterLink v-else to="/profile">Профиль</RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin">Админка</RouterLink>
        </nav>
      </div>
    </header>

    <main class="page">
      <RouterView />
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <span>© 2026 SoraManga</span>
        <span>Дипломный SPA-проект на Vue</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  }
}
</script>

<style>
:root {
  --container-max-width: 1100px;
  --container-padding: clamp(12px, 2.2vw, 20px);
  --radius-md: 10px;
  --focus-ring: 0 0 0 3px rgba(236, 72, 153, 0.25);
}

* {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-behavior: smooth;
  overflow-x: clip;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Arial, 'Noto Sans', sans-serif;
  line-height: 1.45;
  letter-spacing: normal;
  word-spacing: normal;
  color: #4e2a3a;
  background:
    radial-gradient(circle at 10% 25%, #ffd1dc 0, #ffd1dc 14%, transparent 15%),
    radial-gradient(circle at 90% 85%, #ffc6da 0, #ffc6da 10%, transparent 11%),
    linear-gradient(160deg, #fff6fb 0%, #ffeef8 48%, #ffe2f0 100%);
  overflow-x: hidden;
}

img,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

a,
button,
input,
select,
textarea {
  font: inherit;
}

button,
.navbar a {
  min-height: 36px;
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

h1, h2, h3, h4, h5, h6, p, span, a, button, input {
  letter-spacing: normal;
  word-spacing: normal;
  overflow-wrap: anywhere;
}

#app,
.layout {
  min-height: 100vh;
}

.layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.header {
  border-bottom: 1px solid #f1bfd2;
  background: rgba(255, 255, 255, 0.86);
  position: sticky;
  top: 0;
  z-index: 30;
}

@supports ((-webkit-backdrop-filter: blur(8px)) or (backdrop-filter: blur(8px))) {
  .header {
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
  }
}

.header-inner,
.footer-inner {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 max(var(--container-padding), env(safe-area-inset-left));
  padding-right: max(var(--container-padding), env(safe-area-inset-right));
}

.header-inner {
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.brand-group {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
  text-decoration: none;
  color: #c2185b;
}

.tagline {
  margin: 0;
  color: #8e365a;
  font-size: 11px;
  line-height: 1.2;
}

.navbar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.navbar a {
  text-decoration: none;
  color: #8e365a;
  font-size: 13px;
  line-height: 1.2;
  letter-spacing: 0 !important;
  word-spacing: 0 !important;
  font-kerning: normal;
  padding: 5px 9px;
  border-radius: 999px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.navbar a.router-link-exact-active {
  background: linear-gradient(135deg, #ff82b4, #ff5e9a);
  color: #fff;
}

.page {
  max-width: var(--container-max-width);
  width: 100%;
  margin: 0 auto;
  padding: 12px max(var(--container-padding), env(safe-area-inset-left)) calc(18px + env(safe-area-inset-bottom));
  padding-right: max(var(--container-padding), env(safe-area-inset-right));
}

.page > * {
  min-width: 0;
}

.footer {
  border-top: 1px solid #f1bfd2;
  background: rgba(255, 255, 255, 0.75);
}

.footer-inner {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #8e365a;
  letter-spacing: 0 !important;
  word-spacing: 0 !important;
  font-kerning: normal;
}

@media (max-width: 640px) {
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .navbar {
    width: 100%;
  }
  .brand-group {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
  .footer-inner {
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

@media (max-width: 400px) {
  .logo {
    font-size: 20px;
  }
  .navbar a {
    font-size: 12px;
    padding: 4px 8px;
  }
}

@media (min-width: 1280px) {
  :root {
    --container-max-width: 1240px;
  }
}

@media (min-width: 1600px) {
  :root {
    --container-max-width: 1360px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
