import { SHIKIMORI_AGE_RATING_BY_ID } from '../data/shikimoriAgeRatings'

/** Shikimori: rx = контент 18+ */
export function getShikimoriAgeRating(mangaId) {
  return SHIKIMORI_AGE_RATING_BY_ID[Number(mangaId)] || 'none'
}

export function isMangaAdultOnly(mangaOrId) {
  const rating =
    typeof mangaOrId === 'object' && mangaOrId
      ? mangaOrId.ageRating || getShikimoriAgeRating(mangaOrId.id)
      : getShikimoriAgeRating(mangaOrId)
  return rating === 'rx'
}

export function getAgeRatingLabel(rating) {
  const map = {
    none: '0+',
    g: '6+',
    pg: '12+',
    r: '13+',
    r_plus: '16+',
    rx: '18+'
  }
  return map[rating] || '0+'
}

export function parseBirthDate(value) {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

export function getUserAge(birthDate) {
  const date = parseBirthDate(birthDate)
  if (!date) {
    return null
  }
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const monthDiff = today.getMonth() - date.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1
  }
  return age
}

export function isUserAdult(birthDate) {
  const age = getUserAge(birthDate)
  if (age === null) {
    return true
  }
  return age >= 18
}

export function canReadManga(manga, user) {
  if (!isMangaAdultOnly(manga)) {
    return { allowed: true }
  }
  if (!user) {
    return {
      allowed: false,
      reason: 'Войдите в аккаунт, чтобы проверить возраст для чтения 18+.'
    }
  }
  if (!user.birthDate) {
    return {
      allowed: false,
      reason: 'Укажите дату рождения в профиле для доступа к манге 18+.'
    }
  }
  if (!isUserAdult(user.birthDate)) {
    return {
      allowed: false,
      reason: 'Вам нет 18 лет. Эта манга закрыта для чтения.'
    }
  }
  return { allowed: true }
}

export function attachAgeRating(manga) {
  if (!manga) {
    return manga
  }
  const ageRating = manga.ageRating || getShikimoriAgeRating(manga.id)
  return {
    ...manga,
    ageRating,
    ageLabel: getAgeRatingLabel(ageRating),
    isAdultOnly: ageRating === 'rx'
  }
}
