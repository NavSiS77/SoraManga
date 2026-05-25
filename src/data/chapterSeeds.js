import { chainsawManChapterList } from './chainsawManChapters.data.js'

/** Пути к страницам в public/manga/{mangaId}/chapters/{folder}/001.jpg … */
export function buildChapterPages(mangaId, chapterFolder, pageCount) {
  return Array.from({ length: pageCount }, (_, index) => {
    const num = index + 1
    return {
      number: num,
      imageUrl: `/manga/${mangaId}/chapters/${chapterFolder}/${String(num).padStart(3, '0')}.jpg`
    }
  })
}

export const chainsawManChapters = chainsawManChapterList
