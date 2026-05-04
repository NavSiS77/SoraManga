import { genres, mangaList } from '../data/mockData'

const dbStorageKey = 'soramanga_db'
const usersStorageKey = 'soramanga_users'
const dbVersion = 7

const clone = (value) => JSON.parse(JSON.stringify(value))
const rootScope = Function('return this')()
const runSql = (sql, params = []) => {
  if (!rootScope.alasql) {
    throw new Error('AlaSQL не загружен')
  }
  return rootScope.alasql(sql, params)
}

const loadUsers = () => {
  const saved = localStorage.getItem(usersStorageKey)
  if (saved) {
    const users = JSON.parse(saved)
    const admin = users.find((item) => item.login === 'admin')
    if (!admin) {
      users.push({ id: 1, login: 'admin', password: 'admin123', role: 'ADMIN' })
      localStorage.setItem(usersStorageKey, JSON.stringify(users))
      return users
    }
    if (admin.password === 'admin') {
      admin.password = 'admin123'
      localStorage.setItem(usersStorageKey, JSON.stringify(users))
    }
    return users
  }
  const initialUsers = [
    { id: 1, login: 'admin', password: 'admin123', role: 'ADMIN' }
  ]
  localStorage.setItem(usersStorageKey, JSON.stringify(initialUsers))
  return initialUsers
}

const loadDb = () => {
  const initialDb = {
    version: dbVersion,
    name: 'manga.db',
    genres: clone(genres),
    manga: clone(mangaList)
  }
  const saved = localStorage.getItem(dbStorageKey)
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed.version === dbVersion) {
      return parsed
    }

    const seedIds = new Set(initialDb.manga.map((item) => item.id))
    const oldManga = Array.isArray(parsed.manga) ? parsed.manga : []
    const customManga = oldManga.filter((item) => !seedIds.has(item.id))
    const migratedDb = {
      ...initialDb,
      manga: [...initialDb.manga, ...customManga]
    }
    localStorage.setItem(dbStorageKey, JSON.stringify(migratedDb))
    return migratedDb
  }
  localStorage.setItem(dbStorageKey, JSON.stringify(initialDb))
  return initialDb
}

const saveDb = (db) => {
  localStorage.setItem(dbStorageKey, JSON.stringify(db))
}

export const DbService = {
  getGenres() {
    const db = loadDb()
    return clone(db.genres)
  },
  getCatalog({ searchQuery = '', genreId = null } = {}) {
    const db = loadDb()
    const rows = db.manga.map((item) => ({
      ...item,
      titleLower: item.title.toLowerCase(),
      genresCsv: `,${item.genres.join(',')},`
    }))
    const query = searchQuery.trim().toLowerCase()
    const sql = `
      SELECT * FROM ? 
      WHERE titleLower LIKE ? 
      AND (? IS NULL OR genresCsv LIKE ?)
    `
    const filtered = runSql(sql, [rows, `%${query}%`, genreId, `%,${genreId},%`])
    return clone(filtered).map((item) => {
      delete item.titleLower
      delete item.genresCsv
      return item
    })
  },
  getById(id) {
    const db = loadDb()
    return clone(db.manga.find((item) => item.id === Number(id)) || null)
  },
  addManga(payload) {
    const db = loadDb()
    const nextId = db.manga.length ? Math.max(...db.manga.map((item) => item.id)) + 1 : 1
    const newManga = {
      id: nextId,
      title: payload.title,
      coverUrl: payload.coverUrl || 'https://placehold.co/320x460/fbcfe8/831843?text=Новая+манга',
      description: payload.description,
      status: payload.status || 'ONGOING',
      views: 0,
      genres: payload.genres || [],
      chapters: []
    }
    db.manga.push(newManga)
    saveDb(db)
    return clone(newManga)
  },
  addChapter(mangaId, payload) {
    const db = loadDb()
    const manga = db.manga.find((item) => item.id === Number(mangaId))
    if (!manga) {
      return null
    }
    const chapterId = Date.now()
    const chapter = {
      id: chapterId,
      number: payload.number,
      title: payload.title,
      pages: payload.pages || []
    }
    manga.chapters.push(chapter)
    saveDb(db)
    return clone(chapter)
  },
  login({ login, password }) {
    const users = loadUsers()
    const user = runSql('SELECT * FROM ? WHERE login = ? AND password = ?', [users, login, password])[0]
    if (!user) {
      throw new Error('Неверный логин или пароль')
    }
    return { id: user.id, login: user.login, role: user.role }
  },
  register({ login, password }) {
    const users = loadUsers()
    const exists = runSql('SELECT * FROM ? WHERE login = ?', [users, login])[0]
    if (exists) {
      throw new Error('Пользователь с таким логином уже существует')
    }
    const user = {
      id: Date.now(),
      login,
      password,
      role: 'USER'
    }
    users.push(user)
    localStorage.setItem(usersStorageKey, JSON.stringify(users))
    return { id: user.id, login: user.login, role: user.role }
  }
}
