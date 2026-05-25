/** Номер тома для главы (как в списке на странице тайтла). */
export function getChapterVolumeNumber(chapter) {
  const raw = chapter?.volume ?? chapter?.number ?? 1
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/**
 * Группировка плоского списка глав по томам для карточки тайтла.
 */
export function groupChaptersByVolume(chapters) {
  if (!Array.isArray(chapters) || !chapters.length) {
    return []
  }

  const byVolume = new Map()

  for (const chapter of chapters) {
    const volumeNumber = getChapterVolumeNumber(chapter)
    if (!byVolume.has(volumeNumber)) {
      byVolume.set(volumeNumber, {
        number: volumeNumber,
        chapters: []
      })
    }
    byVolume.get(volumeNumber).chapters.push(chapter)
  }

  return [...byVolume.values()]
    .map((volume) => {
      const chapters = [...volume.chapters].sort((a, b) => Number(a.number) - Number(b.number))
      return {
        number: volume.number,
        title: getVolumeListTitle({ ...volume, chapters }),
        chapters
      }
    })
    .sort((a, b) => a.number - b.number)
}

/** Название тома после «Том N:» — например «Пес и бензопила». */
export function getVolumeListTitle(volume) {
  const chapters = volume.chapters || []
  const first = chapters[0]
  if (!first) {
    return volume.title || ''
  }

  const fromFirstChapter = getChapterSubtitle(first.title)
  if (fromFirstChapter) {
    return fromFirstChapter
  }

  return volume.title || `Том ${volume.number}`
}

/** «Глава 1. Пес и бензопила» → «Пес и бензопила». */
export function getChapterSubtitle(title) {
  const raw = String(title || '').trim()
  const stripped = raw.replace(/^глава\s+[\d.]+\s*[.:–-]?\s*/i, '').trim()
  return stripped || ''
}

/** «Том 1: Глава 2. Там, где сейчас Потита» */
export function formatChapterListLabel(volumeNumber, chapter) {
  const subtitle = getChapterSubtitle(chapter.title)
  if (subtitle) {
    return `Том ${volumeNumber}: Глава ${chapter.number}. ${subtitle}`
  }
  return `Том ${volumeNumber}: Глава ${chapter.number}`
}

export function getVolumeTitleFromChapter(chapter) {
  if (chapter.volumeTitle) {
    return chapter.volumeTitle
  }
  const raw = String(chapter.title || '').trim()
  const stripped = raw.replace(/^глава\s+[\d.]+\s*[.:–-]?\s*/i, '').trim()
  return stripped || raw || `Том ${chapter.volume ?? chapter.number}`
}

export function getVolumeReadChapter(volume) {
  return (
    volume.chapters.find((chapter) => Array.isArray(chapter.pages) && chapter.pages.length > 0) ||
    null
  )
}
