import { genres, mangaList } from '../data/mockData'
import { getShikimoriAgeRating } from '../utils/ageRestriction'
import { getShikimoriScore, getShikimoriPopularityRank } from '../data/shikimoriScores'
import { getChapterVolumeNumber } from '../utils/volumes'

const dbStorageKey = 'soramanga_db'
const usersStorageKey = 'soramanga_users'
const dbVersion = 21

const clone = (value) => JSON.parse(JSON.stringify(value))

const withShikimoriRatings = (list) =>
  list.map((m) => ({
    ...m,
    ageRating: m.ageRating || getShikimoriAgeRating(m.id),
    rating: Math.round(getShikimoriScore(m.id, m.rating) * 100) / 100,
    popularityRank: getShikimoriPopularityRank(m.id)
  }))

const stripInvalidChainsawVolumes = (manga) => {
  if (Number(manga.id) !== 12 || !Array.isArray(manga.chapters)) {
    return manga
  }
  return {
    ...manga,
    chapters: manga.chapters.filter((chapter) => Number(chapter.volume) !== 8)
  }
}

const normalizeMangaList = (list) => withShikimoriRatings(list.map(stripInvalidChainsawVolumes))
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
    manga: normalizeMangaList(clone(mangaList))
  }
  const saved = localStorage.getItem(dbStorageKey)
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed.version === dbVersion) {
      return parsed
    }

    const seedIds = new Set(initialDb.manga.map((item) => item.id))
    const oldManga = Array.isArray(parsed.manga) ? parsed.manga : []
    const oldById = new Map(oldManga.map((item) => [item.id, item]))
    const enrichChaptersFromSeed = (oldChapters, seedChapters) => {
      const seedById = new Map(seedChapters.map((ch) => [ch.id, ch]))
      return oldChapters.map((old) => {
        const seed = seedById.get(old.id)
        if (!seed) {
          return old
        }
        return {
          ...old,
          number: seed.number ?? old.number,
          volume: seed.volume ?? old.volume,
          volumeTitle: seed.volumeTitle ?? old.volumeTitle,
          title: seed.title ?? old.title,
          pages: Array.isArray(old.pages) && old.pages.length ? old.pages : seed.pages
        }
      })
    }

    const mergeChapters = (seedChapters, oldChapters) => {
      if (!Array.isArray(oldChapters) || !oldChapters.length) {
        return clone(seedChapters)
      }
      if (!Array.isArray(seedChapters) || !seedChapters.length) {
        return clone(oldChapters)
      }
      const enrichedOld = enrichChaptersFromSeed(oldChapters, seedChapters)
      if (seedChapters.length > enrichedOld.length) {
        return clone(seedChapters)
      }
      const oldIds = new Set(enrichedOld.map((ch) => ch.id))
      const added = seedChapters.filter((ch) => !oldIds.has(ch.id))
      if (added.length) {
        return clone(
          [...enrichedOld, ...added].sort((a, b) => a.number - b.number)
        )
      }
      return clone(enrichedOld)
    }

    const mergedSeedManga = initialDb.manga.map((seed) => {
      const old = oldById.get(seed.id)
      if (!old || !Array.isArray(old.chapters) || !old.chapters.length) {
        return seed
      }
      return { ...seed, chapters: mergeChapters(seed.chapters, old.chapters) }
    })
    const customManga = oldManga
      .filter((item) => !seedIds.has(item.id))
      .map(stripInvalidChainsawVolumes)
    const migratedDb = {
      ...initialDb,
      manga: normalizeMangaList([...mergedSeedManga, ...customManga])
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
      chapters: [],
      ageRating: payload.ageRating || 'none',
      rating: Math.round(getShikimoriScore(nextId, payload.rating ?? 8) * 100) / 100,
      popularityRank: getShikimoriPopularityRank(nextId)
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
    const volume = Number(payload.volume) || 1
    const chapter = {
      id: chapterId,
      number: payload.number,
      volume,
      volumeTitle: payload.volumeTitle || `Том ${volume}`,
      title: payload.title,
      pages: payload.pages || []
    }
    manga.chapters.push(chapter)
    manga.chapters.sort((a, b) => Number(a.volume) - Number(b.volume) || Number(a.number) - Number(b.number))
    saveDb(db)
    return clone(chapter)
  },
  deleteChapter(mangaId, chapterId) {
    const db = loadDb()
    const manga = db.manga.find((item) => item.id === Number(mangaId))
    if (!manga) {
      return false
    }
    const before = manga.chapters.length
    manga.chapters = manga.chapters.filter((chapter) => chapter.id !== Number(chapterId))
    if (manga.chapters.length === before) {
      return false
    }
    saveDb(db)
    return true
  },
  deleteVolume(mangaId, volumeNumber) {
    const db = loadDb()
    const manga = db.manga.find((item) => item.id === Number(mangaId))
    if (!manga) {
      return false
    }
    const volume = Number(volumeNumber)
    const before = manga.chapters.length
    manga.chapters = manga.chapters.filter(
      (chapter) => getChapterVolumeNumber(chapter) !== volume
    )
    if (manga.chapters.length === before) {
      return false
    }
    saveDb(db)
    return true
  },
  login({ login, password }) {
    const users = loadUsers()
    const user = runSql('SELECT * FROM ? WHERE login = ? AND password = ?', [users, login, password])[0]
    if (!user) {
      throw new Error('Неверный логин или пароль')
    }
    return { id: user.id, login: user.login, role: user.role, birthDate: user.birthDate || null }
  },
  register({ login, password, birthDate }) {
    const users = loadUsers()
    const exists = runSql('SELECT * FROM ? WHERE login = ?', [users, login])[0]
    if (exists) {
      throw new Error('Пользователь с таким логином уже существует')
    }
    const user = {
      id: Date.now(),
      login,
      password,
      role: 'USER',
      birthDate: birthDate || null
    }
    users.push(user)
    localStorage.setItem(usersStorageKey, JSON.stringify(users))
    return { id: user.id, login: user.login, role: user.role, birthDate: user.birthDate }
  },
  updateUserBirthDate(userId, birthDate) {
    const users = loadUsers()
    const user = users.find((item) => item.id === Number(userId))
    if (!user) {
      return null
    }
    user.birthDate = birthDate
    localStorage.setItem(usersStorageKey, JSON.stringify(users))
    return { id: user.id, login: user.login, role: user.role, birthDate: user.birthDate }
  }
}
