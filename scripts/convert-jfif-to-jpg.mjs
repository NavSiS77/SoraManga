/** JFIF to 001.jpg, 002.jpg in public/manga/12/chapters. Run: npm run convert:jfif */

import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const chaptersRoot = path.resolve(__dirname, '../public/manga/12/chapters')

async function convertFolder(folderPath, folderName) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true })
  const jfifFiles = entries
    .filter((e) => e.isFile() && /\.jfif$/i.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  if (!jfifFiles.length) {
    return { folder: folderName, converted: 0 }
  }

  let converted = 0
  for (let i = 0; i < jfifFiles.length; i += 1) {
    const src = path.join(folderPath, jfifFiles[i])
    const dest = path.join(folderPath, `${String(i + 1).padStart(3, '0')}.jpg`)

    try {
      await fs.access(dest)
      console.log(`  пропуск ${folderName}/${path.basename(dest)} — уже есть`)
    } catch {
      await sharp(src).jpeg({ quality: 90, mozjpeg: true }).toFile(dest)
      converted += 1
    }

    await fs.unlink(src)
  }

  return { folder: folderName, converted }
}

async function main() {
  const folders = (await fs.readdir(chaptersRoot, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => Number(a) - Number(b))

  let total = 0
  for (const folder of folders) {
    const folderPath = path.join(chaptersRoot, folder)
    const result = await convertFolder(folderPath, folder)
    if (result.converted) {
      console.log(`Том ${folder}: ${result.converted} файлов → jpg`)
      total += result.converted
    }
  }

  console.log(`\nГотово. Конвертировано: ${total} файлов.`)
  console.log('Дальше: npm run sync:chainsaw')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
