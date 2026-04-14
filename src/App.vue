<template>
  <div class="layout">
    <header class="topbar">
      <RouterLink to="/" class="brand">SoraManga</RouterLink>
      <nav class="menu">
        <RouterLink to="/">Каталог</RouterLink>
        <RouterLink to="/profile">Профиль</RouterLink>
        <RouterLink to="/auth">Вход</RouterLink>
      </nav>
    </header>
    <main class="page">
      <RouterView />
    </main>
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
  font-family: 'Noto Sans JP', 'Yu Gothic', 'Segoe UI', Arial, sans-serif;
  background:
    radial-gradient(circle at 10% 20%, #ffd1dc 0, #ffd1dc 16%, transparent 17%),
    radial-gradient(circle at 86% 24%, #ffc6da 0, #ffc6da 12%, transparent 13%),
    linear-gradient(160deg, #fff6fb 0%, #ffeef8 48%, #ffe2f0 100%);
  color: #4e2a3a;
}

.layout {
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.84);
  border-bottom: 1px solid #f3bfd3;
  backdrop-filter: blur(4px);
}

.brand {
  text-decoration: none;
  color: #c2185b;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 22px;
  transition: transform 0.2s ease, text-shadow 0.2s ease;
}

.brand:hover {
  transform: translateY(-1px);
  text-shadow: 0 8px 20px rgba(194, 24, 91, 0.25);
}

.menu {
  display: flex;
  gap: 14px;
}

.menu a {
  color: #8e365a;
  text-decoration: none;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.menu a:hover {
  background: #ffe0ee;
  border-color: #f8bfd5;
}

.menu a.router-link-exact-active {
  background: linear-gradient(135deg, #ff82b4, #ff5e9a);
  color: #fff;
  border-color: #ff5e9a;
  box-shadow: 0 8px 16px rgba(255, 94, 154, 0.3);
}

.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 40px;
}
</style>
