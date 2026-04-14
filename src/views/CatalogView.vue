<template>
  <section class="home">
    <div class="top-tools">
      <div class="tabs">
        <button class="tab active">Каталог</button>
        <button class="tab">Топы</button>
        <button class="tab">Форум</button>
        <button class="tab">Жанры</button>
      </div>
      <input class="search" type="text" placeholder="Поиск тайтлов..." >
    </div>

    <article class="promo">
      <div>
        <h3>Твой список чтения в SoraManga</h3>
        <p>Сохраняй прогресс, добавляй тайтлы в избранное и получай рекомендации.</p>
      </div>
      <button>Подписаться</button>
    </article>

    <section class="feed-block">
      <header class="block-head">
        <h2>Сейчас читают</h2>
        <a href="#">Смотреть все</a>
      </header>
      <div class="row-cards">
        <article v-for="card in nowReading" :key="card.id" class="cover-card">
          <div class="cover">{{ card.emoji }}</div>
          <h4>{{ card.title }}</h4>
          <p>{{ card.genre }}</p>
        </article>
      </div>
    </section>

    <section class="triple-grid">
      <article class="column-card">
        <h3>Новинки</h3>
        <ul>
          <li v-for="item in updates" :key="item.id">
            <span class="icon">{{ item.emoji }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.chapter }}</p>
            </div>
          </li>
        </ul>
      </article>
      <article class="column-card">
        <h3>Набирают популярность</h3>
        <ul>
          <li v-for="item in trending" :key="item.id">
            <span class="icon">{{ item.emoji }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.chapter }}</p>
            </div>
          </li>
        </ul>
      </article>
      <article class="column-card">
        <h3>Популярное</h3>
        <ul>
          <li v-for="item in popular" :key="item.id">
            <span class="icon">{{ item.emoji }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.chapter }}</p>
            </div>
          </li>
        </ul>
      </article>
    </section>

    <section class="feed-block">
      <header class="block-head">
        <h2>Горячие новинки</h2>
        <a href="#">Обновить</a>
      </header>
      <div class="row-cards">
        <article v-for="card in hotList" :key="card.id" class="cover-card">
          <div class="cover">{{ card.emoji }}</div>
          <h4>{{ card.title }}</h4>
          <p>{{ card.genre }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script>
export default {
  name: 'CatalogView',
  data() {
    return {
      nowReading: [
        { id: 1, emoji: '⚔️', title: 'Клинок тумана', genre: 'Экшен' },
        { id: 2, emoji: '🌸', title: 'Лепестки неба', genre: 'Романтика' },
        { id: 3, emoji: '🔥', title: 'Империя огня', genre: 'Фэнтези' },
        { id: 4, emoji: '🦊', title: 'Лисий контракт', genre: 'Мистика' },
        { id: 5, emoji: '🌙', title: 'Moon Diary', genre: 'Драма' },
        { id: 6, emoji: '🎴', title: 'Хроники хару', genre: 'Школа' },
        { id: 7, emoji: '🗻', title: 'Путь ветра', genre: 'Приключения' },
        { id: 8, emoji: '🛡️', title: 'Стальной ранг', genre: 'Боевик' }
      ],
      hotList: [
        { id: 11, emoji: '🐉', title: 'Драконья клятва', genre: 'Фэнтези' },
        { id: 12, emoji: '🎀', title: 'Розовый код', genre: 'Комедия' },
        { id: 13, emoji: '🌌', title: 'Небесный город', genre: 'Фантастика' },
        { id: 14, emoji: '🕯️', title: 'Шепот храма', genre: 'Мистика' },
        { id: 15, emoji: '💠', title: 'Ледяной орден', genre: 'Экшен' },
        { id: 16, emoji: '🍡', title: 'Сладкий апрель', genre: 'Романтика' }
      ],
      updates: [
        { id: 21, emoji: '🌸', title: 'Лепестки неба', chapter: 'Том 4, Глава 28' },
        { id: 22, emoji: '⚔️', title: 'Клинок тумана', chapter: 'Том 8, Глава 66' },
        { id: 23, emoji: '🌙', title: 'Moon Diary', chapter: 'Том 2, Глава 14' }
      ],
      trending: [
        { id: 24, emoji: '🦊', title: 'Лисий контракт', chapter: 'Том 3, Глава 21' },
        { id: 25, emoji: '🔥', title: 'Империя огня', chapter: 'Том 6, Глава 41' },
        { id: 26, emoji: '🗻', title: 'Путь ветра', chapter: 'Том 1, Глава 8' }
      ],
      popular: [
        { id: 27, emoji: '🎴', title: 'Хроники хару', chapter: 'Том 9, Глава 75' },
        { id: 28, emoji: '🛡️', title: 'Стальной ранг', chapter: 'Том 7, Глава 54' },
        { id: 29, emoji: '🐉', title: 'Драконья клятва', chapter: 'Том 5, Глава 33' }
      ]
    }
  }
}
</script>

<style scoped>
.home {
  display: grid;
  gap: 10px;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.top-tools {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 6px;
}

.tab {
  border: 1px solid #efbfd3;
  background: #ffffffb8;
  color: #7f3652;
  border-radius: 999px;
  font-size: 13px;
  padding: 6px 10px;
  line-height: 1.2;
  cursor: pointer;
}

.tab.active {
  color: #fff;
  background: linear-gradient(135deg, #ff82b4, #ff5e9a);
}

.search {
  min-width: 240px;
  border-radius: 999px;
  border: 1px solid #efbfd3;
  background: #ffffffb8;
  font-size: 13px;
  line-height: 1.2;
  padding: 8px 12px;
  color: #5a2b3e;
}

.glass {
  border-radius: 14px;
  border: 1px solid #20202033;
  background: linear-gradient(150deg, #ffffffdd 0%, #ffe3f0b8 100%);
  box-shadow: 0 14px 24px rgba(153, 73, 110, 0.12);
  padding: 12px;
}

.promo {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(145deg, #fff, #ffe5f1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
}

.promo h3 {
  margin: 0 0 2px;
  font-size: 19px;
  line-height: 1.2;
  letter-spacing: normal;
  word-spacing: normal;
  font-weight: 700;
  font-stretch: normal;
}

.promo p {
  margin: 0;
  font-size: 14px;
  line-height: 1.3;
  color: #74495b;
  letter-spacing: normal;
  word-spacing: normal;
  font-stretch: normal;
}

.promo button {
  border: none;
  border-radius: 10px;
  background: #212121;
  color: #fff;
  font-size: 13px;
  line-height: 1.2;
  padding: 8px 12px;
  cursor: pointer;
}

.feed-block {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffffdd 0%, #ffe3f0a8 100%);
  padding: 10px;
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-head h2 {
  margin: 0;
  font-size: 19px;
  line-height: 1.2;
}

.block-head a {
  color: #a73667;
  text-decoration: none;
}

.row-cards {
  margin-top: 8px;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(135px, 1fr);
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.cover-card {
  min-width: 135px;
}

.cover {
  height: 168px;
  border-radius: 10px;
  border: 1px solid #8f8f8f;
  background: linear-gradient(150deg, #ffffff 15%, #ffc7dd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  box-shadow: 0 6px 10px rgba(90, 61, 73, 0.14);
}

.cover-card h4 {
  margin: 6px 0 2px;
  font-size: 13px;
  line-height: 1.2;
}

.cover-card p {
  margin: 0;
  color: #5f4a53;
  font-size: 11px;
  line-height: 1.2;
}

.triple-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.column-card {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffffdd 0%, #ffe3f0a8 100%);
  padding: 10px;
}

.column-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 1.2;
}

.column-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.column-card li {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 7px;
  border-radius: 10px;
  background: #fff8fc;
}

.icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #ffd8e9;
}

.column-card strong {
  display: block;
  font-size: 13px;
  line-height: 1.2;
}

.column-card p {
  margin: 0;
  font-size: 11px;
  line-height: 1.2;
  color: #7a4d5f;
}

@media (max-width: 760px) {
  .top-tools {
    flex-direction: column;
    align-items: stretch;
  }
  .search {
    min-width: 0;
  }
  .promo {
    flex-direction: column;
    align-items: flex-start;
  }
  .triple-grid {
    grid-template-columns: 1fr;
  }
}
</style>
