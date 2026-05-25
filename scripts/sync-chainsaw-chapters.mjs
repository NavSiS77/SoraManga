/**
 * Сканирует public/manga/12/chapters — каждая подпапка = глава тома 1.
 * Запуск: npm run sync:chainsaw
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const chaptersDir = path.join(rootDir, 'public', 'manga', '12', 'chapters')
const outFile = path.join(rootDir, 'src', 'data', 'chainsawManChapters.data.js')

const VOLUME_NUMBER = 1
const VOLUME_TITLE = 'Том 1'

const chapterTitles = {
  1: 'Глава 1. Пес и бензопила',
  2: 'Глава 2. Там, где сейчас Потита',
  3: 'Глава 3. Прибытие в Токио',
  4: 'Глава 4. Пауэр',
  5: 'Глава 5. Попытка потрогать чью-нибудь грудь',
  6: 'Глава 6. Услуга',
  7: 'Глава 7. Местонахождение мяукалки'
}

async function countJpg(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  return entries.filter((e) => e.isFile() && /\.jpe?g$/i.test(e.name)).length
}

async function main() {
  const folders = (await fs.readdir(chaptersDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => Number(a) - Number(b))

  const defs = []
  for (const folder of folders) {
    const chapterNumber = Number(folder)
    if (!Number.isFinite(chapterNumber)) {
      continue
    }
    const pages = await countJpg(path.join(chaptersDir, folder))
    const title = chapterTitles[chapterNumber] || `Глава ${chapterNumber}`
    defs.push({
      folder,
      chapterNumber,
      volume: VOLUME_NUMBER,
      volumeTitle: VOLUME_TITLE,
      title,
      pages
    })
  }

  const body = `/** Сгенерировано scripts/sync-chainsaw-chapters.mjs — не правьте вручную */
${generateFileContent(defs)}
`
  await fs.writeFile(outFile, body, 'utf8')
  console.log(`Том ${VOLUME_NUMBER}: ${defs.length} глав → ${outFile}`)
  defs.forEach((d) => console.log(`  Глава ${d.chapterNumber}: ${d.pages} стр.`))
}

function generateFileContent(defs) {
  const lines = defs.map(
    (d) =>
      `  { folder: '${d.folder}', chapterNumber: ${d.chapterNumber}, volume: ${d.volume}, volumeTitle: ${JSON.stringify(d.volumeTitle)}, title: ${JSON.stringify(d.title)}, pages: ${d.pages} }`
  )
  return `function buildPages(chapterFolder, pageCount) {
  if (!pageCount) return []
  return Array.from({ length: pageCount }, (_, index) => {
    const num = index + 1
    return {
      number: num,
      imageUrl: \`/manga/12/chapters/\${chapterFolder}/\${String(num).padStart(3, '0')}.jpg\`
    }
  })
}

const chainsawManChapterDefs = [
${lines.join(',\n')}
]

export const chainsawManChapterList = chainsawManChapterDefs.map((def) => ({
  id: 120000 + def.chapterNumber,
  number: def.chapterNumber,
  volume: def.volume,
  volumeTitle: def.volumeTitle,
  title: def.title,
  pages: buildPages(def.folder, def.pages)
}))
`
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
