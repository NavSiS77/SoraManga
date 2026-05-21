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

export const chainsawManChapters = [
  {
    id: 120001,
    number: 1,
    title: 'Глава 1. Пес и бензопила',
    pages: buildChapterPages(12, 1, 53)
  }
]
