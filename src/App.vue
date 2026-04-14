<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <div class="brand-group">
          <RouterLink to="/" class="logo">SoraManga</RouterLink>
          <p class="tagline">Manga reader platform</p>
        </div>
        <nav class="navbar">
          <RouterLink to="/">Главная</RouterLink>
          <RouterLink to="/">Каталог</RouterLink>
          <RouterLink to="/">Вход / Регистрация</RouterLink>
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
export default {
  name: 'App'
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Arial, 'Noto Sans', sans-serif;
  letter-spacing: normal;
  word-spacing: normal;
  color: #4e2a3a;
  background:
    radial-gradient(circle at 10% 25%, #ffd1dc 0, #ffd1dc 14%, transparent 15%),
    radial-gradient(circle at 90% 85%, #ffc6da 0, #ffc6da 10%, transparent 11%),
    linear-gradient(160deg, #fff6fb 0%, #ffeef8 48%, #ffe2f0 100%);
}

h1, h2, h3, h4, h5, h6, p, span, a, button, input {
  letter-spacing: normal;
  word-spacing: normal;
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
}

.header-inner,
.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
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
}

.navbar a.router-link-exact-active {
  background: linear-gradient(135deg, #ff82b4, #ff5e9a);
  color: #fff;
}

.page {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 12px 14px 18px;
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
</style>
