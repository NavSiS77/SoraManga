<template>
  <section class="admin">
    <header class="admin-head">
      <h1>Админ-панель</h1>
      <p>Добавление манги и глав</p>
    </header>

    <p v-if="adminMessage" class="admin-message" :class="adminMessageType">{{ adminMessage }}</p>

    <div class="admin-top">
      <article class="panel">
        <h2 class="panel-title">Добавить мангу</h2>
        <form class="admin-form" @submit.prevent="createManga">
          <label class="field">
            <span class="field-label">Название</span>
            <input v-model.trim="title" type="text" placeholder="Название тайтла" required>
          </label>
          <label class="field">
            <span class="field-label">Описание</span>
            <textarea v-model.trim="description" placeholder="Краткое описание" rows="3" required></textarea>
          </label>
          <label class="field">
            <span class="field-label">Жанры (ID через запятую)</span>
            <input v-model.trim="genreIdsText" type="text" placeholder="1, 2, 3">
          </label>
          <label class="field">
            <span class="field-label">Обложка (JPG)</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg"
              @change="onCoverChange"
            >
          </label>
          <p v-if="coverPreview" class="file-hint">
            <img :src="coverPreview" alt="" class="cover-preview">
            Обложка выбрана
          </p>
          <button class="btn btn-primary" type="submit" :disabled="isSavingManga">
            {{ isSavingManga ? 'Сохранение...' : 'Добавить' }}
          </button>
        </form>
      </article>

      <article class="panel">
        <h2 class="panel-title">Добавить главу</h2>
        <form class="admin-form" @submit.prevent="createChapter">
          <label class="field">
            <span class="field-label">Тайтл</span>
            <select v-model="selectedMangaId" required @change="onSelectManga">
              <option disabled value="">Выберите тайтл</option>
              <option v-for="item in mangaStore.mangaList" :key="item.id" :value="item.id">{{ item.title }}</option>
            </select>
          </label>
          <div class="form-row">
            <label class="field field--narrow">
              <span class="field-label">Том №</span>
              <input v-model.number="volumeNumber" type="number" min="1" required>
            </label>
            <label class="field">
              <span class="field-label">Название тома</span>
              <input v-model.trim="volumeTitle" type="text" placeholder="Том 1">
            </label>
          </div>
          <div class="form-row">
            <label class="field field--narrow">
              <span class="field-label">№</span>
              <input v-model.number="chapterNumber" type="number" min="1" placeholder="1" required>
            </label>
            <label class="field">
              <span class="field-label">Название главы</span>
              <input v-model.trim="chapterTitle" type="text" placeholder="Глава 1" required>
            </label>
          </div>
          <label class="field">
            <span class="field-label">Страницы (JPG)</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg"
              multiple
              @change="onChapterFilesChange"
            >
          </label>
          <p v-if="chapterFilesCount" class="file-hint">Выбрано страниц: {{ chapterFilesCount }}</p>
          <button class="btn btn-primary" type="submit" :disabled="isSavingChapter">
            {{ isSavingChapter ? 'Сохранение...' : 'Добавить главу' }}
          </button>
        </form>
      </article>
    </div>

    <article class="panel panel--delete">
      <h2 class="panel-title">Удаление</h2>
      <p class="panel-hint">Удаление тома удаляет все его главы.</p>
      <label class="field">
        <span class="field-label">Тайтл</span>
        <select v-model="manageMangaId">
          <option disabled value="">Выберите тайтл</option>
          <option v-for="item in mangaStore.mangaList" :key="`del-${item.id}`" :value="item.id">{{ item.title }}</option>
        </select>
      </label>

      <template v-if="manageManga">
        <section v-if="manageVolumes.length" class="manage-block">
          <h3>Тома</h3>
          <ul class="manage-list">
            <li v-for="vol in manageVolumes" :key="`vol-${vol.number}`" class="manage-row">
              <span>Том {{ vol.number }}: {{ vol.title }} ({{ vol.chapters.length }} гл.)</span>
              <button type="button" class="btn btn-danger btn-sm" @click="removeVolume(vol.number)">
                Удалить том
              </button>
            </li>
          </ul>
        </section>

        <section v-if="manageChapters.length" class="manage-block">
          <h3>Главы</h3>
          <ul class="manage-list">
            <li v-for="ch in manageChapters" :key="ch.id" class="manage-row">
              <span>Том {{ ch.volume }} · Глава {{ ch.number }} — {{ ch.title }}</span>
              <button type="button" class="btn btn-danger btn-sm" @click="removeChapter(ch.id)">
                Удалить главу
              </button>
            </li>
          </ul>
        </section>
        <p v-if="!manageVolumes.length && !manageChapters.length" class="empty-hint">У этого тайтла нет глав.</p>
      </template>
    </article>
  </section>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useMangaStore } from '../stores/manga'
import { MangaApi } from '../services/mangaApi'
import { groupChaptersByVolume } from '../utils/volumes'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Не удалось прочитать ${file.name}`))
    reader.readAsDataURL(file)
  })
}

async function readPageFiles(fileList) {
  const sorted = [...fileList].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  )
  const pages = []
  for (let i = 0; i < sorted.length; i += 1) {
    const imageUrl = await readFileAsDataUrl(sorted[i])
    pages.push({ number: i + 1, imageUrl })
  }
  return pages
}

export default {
  name: 'AdminView',
  setup() {
    const mangaStore = useMangaStore()

    const adminMessage = ref('')
    const adminMessageType = ref('ok')

    const title = ref('')
    const description = ref('')
    const genreIdsText = ref('')
    const coverFile = ref(null)
    const coverPreview = ref('')
    const isSavingManga = ref(false)

    const selectedMangaId = ref('')
    const volumeNumber = ref(1)
    const volumeTitle = ref('Том 1')
    const chapterNumber = ref(1)
    const chapterTitle = ref('')
    const chapterFiles = ref([])
    const isSavingChapter = ref(false)

    const manageMangaId = ref('')

    const notify = (text, type = 'ok') => {
      adminMessage.value = text
      adminMessageType.value = type
    }

    const manageManga = computed(() =>
      mangaStore.mangaList.find((item) => item.id === Number(manageMangaId.value))
    )

    const manageVolumes = computed(() => {
      if (!manageManga.value?.chapters?.length) {
        return []
      }
      return groupChaptersByVolume(manageManga.value.chapters)
    })

    const manageChapters = computed(() => {
      const list = manageManga.value?.chapters ? [...manageManga.value.chapters] : []
      return list.sort(
        (a, b) => Number(a.volume) - Number(b.volume) || Number(a.number) - Number(b.number)
      )
    })

    const chapterFilesCount = computed(() => chapterFiles.value.length)

    const onCoverChange = (event) => {
      const file = event.target.files?.[0]
      coverFile.value = file || null
      if (file) {
        readFileAsDataUrl(file).then((url) => {
          coverPreview.value = url
        })
      } else {
        coverPreview.value = ''
      }
    }

    const onChapterFilesChange = (event) => {
      chapterFiles.value = [...(event.target.files || [])]
    }

    const onSelectManga = () => {
      manageMangaId.value = selectedMangaId.value
    }

    const createManga = async () => {
      isSavingManga.value = true
      try {
        let coverUrl
        if (coverFile.value) {
          coverUrl = await readFileAsDataUrl(coverFile.value)
        }
        await MangaApi.addManga({
          title: title.value,
          description: description.value,
          coverUrl,
          genres: genreIdsText.value
            .split(',')
            .map((item) => Number(item.trim()))
            .filter(Boolean)
        })
        await mangaStore.fetchCatalog()
        title.value = ''
        description.value = ''
        genreIdsText.value = ''
        coverFile.value = null
        coverPreview.value = ''
        notify('Манга добавлена в каталог')
      } catch (error) {
        notify(error.message || 'Ошибка при добавлении манги', 'err')
      } finally {
        isSavingManga.value = false
      }
    }

    const createChapter = async () => {
      if (!volumeTitle.value.trim()) {
        volumeTitle.value = `Том ${volumeNumber.value}`
      }
      isSavingChapter.value = true
      try {
        const pages = chapterFiles.value.length
          ? await readPageFiles(chapterFiles.value)
          : []
        await MangaApi.addChapter(selectedMangaId.value, {
          number: chapterNumber.value,
          volume: volumeNumber.value,
          volumeTitle: volumeTitle.value,
          title: chapterTitle.value,
          pages
        })
        await mangaStore.fetchCatalog()
        manageMangaId.value = selectedMangaId.value
        chapterNumber.value += 1
        chapterTitle.value = ''
        chapterFiles.value = []
        const pagesMsg = pages.length ? ` (${pages.length} стр.)` : ''
        notify(`Глава добавлена${pagesMsg} — доступна в тайтле`)
      } catch (error) {
        notify(error.message || 'Ошибка при добавлении главы', 'err')
      } finally {
        isSavingChapter.value = false
      }
    }

    const removeChapter = async (chapterId) => {
      if (!manageMangaId.value) {
        return
      }
      if (!window.confirm('Удалить эту главу?')) {
        return
      }
      const ok = await MangaApi.deleteChapter(manageMangaId.value, chapterId)
      if (!ok) {
        notify('Главу не удалось удалить', 'err')
        return
      }
      await mangaStore.fetchCatalog()
      notify('Глава удалена')
    }

    const removeVolume = async (volumeNum) => {
      if (!manageMangaId.value) {
        return
      }
      if (!window.confirm(`Удалить том ${volumeNum} со всеми главами?`)) {
        return
      }
      const ok = await MangaApi.deleteVolume(manageMangaId.value, volumeNum)
      if (!ok) {
        notify('Том не найден или главы не удалены', 'err')
        return
      }
      await mangaStore.fetchCatalog()
      notify(`Том ${volumeNum} удалён`)
    }

    onMounted(async () => {
      await mangaStore.fetchGenres()
      await mangaStore.fetchCatalog()
    })

    return {
      mangaStore,
      adminMessage,
      adminMessageType,
      title,
      description,
      genreIdsText,
      coverPreview,
      isSavingManga,
      selectedMangaId,
      volumeNumber,
      volumeTitle,
      chapterNumber,
      chapterTitle,
      chapterFilesCount,
      isSavingChapter,
      manageMangaId,
      manageManga,
      manageVolumes,
      manageChapters,
      onCoverChange,
      onChapterFilesChange,
      onSelectManga,
      createManga,
      createChapter,
      removeChapter,
      removeVolume
    }
  }
}
</script>

<style scoped>
.admin {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.admin-head h1 {
  margin: 0;
  font-size: clamp(1.35rem, 4vw, 1.6rem);
  font-weight: 800;
  color: #831843;
  line-height: 1.2;
}

.admin-head p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #7f3652;
}

.admin-message {
  margin: 0;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
}

.admin-message.ok {
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.admin-message.err {
  background: #fff1f2;
  color: #9f1239;
  border: 1px solid #fecaca;
}

.admin-top {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}

.panel {
  border-radius: 14px;
  border: 1px solid #efbfd3;
  background: linear-gradient(150deg, #ffffff 0%, #fff8fc 100%);
  padding: 14px 16px;
  box-shadow: 0 6px 18px rgba(153, 73, 110, 0.07);
}

.panel--delete {
  margin-top: 0;
}

.panel-title {
  margin: 0 0 12px;
  font-size: 1.1rem;
  font-weight: 800;
  color: #831843;
}

.panel-hint,
.file-hint,
.empty-hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: #7f3652;
}

.cover-preview {
  display: block;
  margin-top: 6px;
  max-width: 100px;
  max-height: 140px;
  border-radius: 8px;
  border: 1px solid #efbfd3;
  object-fit: cover;
}

.admin-form {
  display: grid;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  align-items: end;
}

.field {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #8e365a;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #e8b8cc;
  background: #fff8fc;
  color: #4e2a3a;
  font-size: 15px;
  font-family: inherit;
  box-sizing: border-box;
}

.field textarea {
  min-height: 80px;
  resize: vertical;
  line-height: 1.4;
}

.field input[type='file'] {
  padding: 6px 8px;
  font-size: 13px;
}

.field select {
  cursor: pointer;
}

.field input::placeholder,
.field textarea::placeholder {
  color: #b8849a;
}

.manage-block {
  margin-top: 12px;
}

.manage-block h3 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #831843;
}

.manage-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.manage-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #efbfd3;
  background: #fff8fc;
  font-size: 13px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  margin-top: 4px;
}

.btn-sm {
  width: auto;
  min-height: 32px;
  padding: 0 10px;
  font-size: 12px;
  margin-top: 0;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #ff82b4, #ec4899);
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.22);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: wait;
}

.btn-danger {
  color: #fff;
  background: linear-gradient(135deg, #f87171, #dc2626);
}

@media (max-width: 720px) {
  .admin-top {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
