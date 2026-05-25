/** Сгенерировано scripts/sync-chainsaw-chapters.mjs — не правьте вручную */
function buildPages(chapterFolder, pageCount) {
  if (!pageCount) return []
  return Array.from({ length: pageCount }, (_, index) => {
    const num = index + 1
    return {
      number: num,
      imageUrl: `/manga/12/chapters/${chapterFolder}/${String(num).padStart(3, '0')}.jpg`
    }
  })
}

const chainsawManChapterDefs = [
  { folder: '1', chapterNumber: 1, volume: 1, volumeTitle: "Том 1", title: "Глава 1. Пес и бензопила", pages: 53 },
  { folder: '2', chapterNumber: 2, volume: 1, volumeTitle: "Том 1", title: "Глава 2. Там, где сейчас Потита", pages: 25 },
  { folder: '3', chapterNumber: 3, volume: 1, volumeTitle: "Том 1", title: "Глава 3. Прибытие в Токио", pages: 24 },
  { folder: '4', chapterNumber: 4, volume: 1, volumeTitle: "Том 1", title: "Глава 4. Пауэр", pages: 19 },
  { folder: '5', chapterNumber: 5, volume: 1, volumeTitle: "Том 1", title: "Глава 5. Попытка потрогать чью-нибудь грудь", pages: 19 },
  { folder: '6', chapterNumber: 6, volume: 1, volumeTitle: "Том 1", title: "Глава 6. Услуга", pages: 19 },
  { folder: '7', chapterNumber: 7, volume: 1, volumeTitle: "Том 1", title: "Глава 7. Местонахождение мяукалки", pages: 18 }
]

export const chainsawManChapterList = chainsawManChapterDefs.map((def) => ({
  id: 120000 + def.chapterNumber,
  number: def.chapterNumber,
  volume: def.volume,
  volumeTitle: def.volumeTitle,
  title: def.title,
  pages: buildPages(def.folder, def.pages)
}))

