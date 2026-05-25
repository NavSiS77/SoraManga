/**
 * Импорт PDF → JPG по главам для читалки SoraManga.
 *
 * 1. Положите PDF в папку soramanga/import/ (см. import/chainsaw-man.config.example.json)
 * 2. Скопируйте example → chainsaw-man.config.json и укажите страницы глав
 * 3. npm run import:pdf
 *
 * Узнать число страниц в PDF: npm run import:pdf:info -- import/ваш-файл.pdf
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pdf } from 'pdf-to-img'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const defaultConfigPath = path.join(rootDir, 'import', 'chainsaw-man.config.json')

const pad3 = (n) => String(n).padStart(3, '0')

async function loadConfig(configPath) {
  const raw = await fs.readFile(configPath, 'utf8')
  return JSON.parse(raw)
}

async function writeJpg(buffer, outPath, quality) {
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await sharp(buffer).jpeg({ quality, mozjpeg: true }).toFile(outPath)
}

function buildChapterJs(chapters, mangaId) {
  const blocks = chapters.map((ch) => {
    const pagesLines = ch.pages
      .map(
        (p) =>
          `      { number: ${p.number}, imageUrl: '${p.imageUrl}' }`
      )
      .join(',\n')
    return `  {
    id: ${ch.id},
    number: ${ch.number},
    title: ${JSON.stringify(ch.title)},
    pages: [
${pagesLines}
    ]
  }`
  })

  return `/** Сгенерировано scripts/import-pdf-chapters.mjs — не правьте вручную */
export const chainsawManChapterList = [
${blocks.join(',\n')}
]
`
}

async function importFromConfig(configPath) {
  const config = await loadConfig(configPath)
  const mangaId = config.mangaId ?? 12
  const pdfPath = path.resolve(rootDir, config.pdfPath)
  const scale = config.scale ?? 2
  const quality = config.jpegQuality ?? 88

  try {
    await fs.access(pdfPath)
  } catch {
    console.error(`PDF не найден: ${pdfPath}`)
    console.error('Положите файл в import/ и укажите pdfPath в конфиге.')
    process.exit(1)
  }

  if (!Array.isArray(config.chapters) || !config.chapters.length) {
    console.error('В конфиге нужен массив chapters с startPage и endPage.')
    process.exit(1)
  }

  console.log(`PDF: ${pdfPath}`)
  console.log(`Манга id=${mangaId}, глав: ${config.chapters.length}`)

  const chapterPlan = config.chapters.map((ch) => {
    const start = ch.startPage
    const end = ch.endPage
    if (!start || !end || end < start) {
      throw new Error(`Неверный диапазон главы ${ch.number}: ${start}–${end}`)
    }
    return {
      ...ch,
      folder: String(ch.folder ?? ch.number),
      start,
      end
    }
  })

  const exportedChapters = chapterPlan.map((ch) => ({
    id: ch.id ?? mangaId * 10000 + ch.number,
    number: ch.number,
    title: ch.title ?? `Глава ${ch.number}`,
    folder: ch.folder,
    start: ch.start,
    end: ch.end,
    pages: []
  }))

  const document = await pdf(pdfPath, { scale })
  let pdfPage = 0

  for await (const buffer of document) {
    pdfPage += 1
    const chapter = exportedChapters.find(
      (ch) => pdfPage >= ch.start && pdfPage <= ch.end
    )
    if (!chapter) {
      continue
    }

    const pageNum = pdfPage - chapter.start + 1
    const fileName = `${pad3(pageNum)}.jpg`
    const outDir = path.join(
      rootDir,
      'public',
      'manga',
      String(mangaId),
      'chapters',
      chapter.folder
    )
    const outPath = path.join(outDir, fileName)

    if (pageNum === 1) {
      console.log(
        `\nГлава ${chapter.number}: PDF стр. ${chapter.start}–${chapter.end} → ${outDir}`
      )
    }

    process.stdout.write(`  ${fileName} (PDF ${pdfPage})… `)
    await writeJpg(buffer, outPath, quality)
    chapter.pages.push({
      number: pageNum,
      imageUrl: `/manga/${mangaId}/chapters/${chapter.folder}/${fileName}`
    })
    console.log('ok')
  }

  const maxEnd = Math.max(...exportedChapters.map((ch) => ch.end))
  if (pdfPage < maxEnd) {
    console.warn(
      `\nВнимание: в PDF только ${pdfPage} стр., а в конфиге указано до стр. ${maxEnd}.`
    )
  }

  for (const chapter of exportedChapters) {
    const expected = chapter.end - chapter.start + 1
    if (chapter.pages.length !== expected) {
      console.warn(
        `Глава ${chapter.number}: ожидалось ${expected} стр., записано ${chapter.pages.length}.`
      )
    }
    delete chapter.start
    delete chapter.end
    delete chapter.folder
  }

  const dataJsPath = path.join(rootDir, 'src', 'data', 'chainsawManChapters.data.js')
  await fs.writeFile(dataJsPath, buildChapterJs(exportedChapters, mangaId), 'utf8')
  console.log(`\nЗаписано: ${dataJsPath}`)
  console.log('Увеличьте dbVersion в src/services/db.js, если главы не появились в браузере.')
  console.log('Или очистите localStorage ключ soramanga_db и обновите страницу.')
}

async function printPdfInfo(pdfArg) {
  const pdfPath = path.resolve(rootDir, pdfArg)
  const document = await pdf(pdfPath, { scale: 1 })
  let count = 0
  for await (const _ of document) {
    count += 1
  }
  console.log(`Файл: ${pdfPath}`)
  console.log(`Страниц в PDF: ${count}`)
}

const args = process.argv.slice(2)
const isInfo = args[0] === 'info' || args.includes('--info')

if (isInfo) {
  const pdfArg = args.find((a) => a.endsWith('.pdf')) || args[args.length - 1]
  if (!pdfArg || pdfArg === 'info' || pdfArg === '--info') {
    console.error('Использование: npm run import:pdf:info -- import/файл.pdf')
    process.exit(1)
  }
  await printPdfInfo(pdfArg)
} else {
  const configFlag = args.indexOf('--config')
  const configPath =
    configFlag >= 0 ? path.resolve(rootDir, args[configFlag + 1]) : defaultConfigPath
  await importFromConfig(configPath)
}
