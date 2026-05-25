/**
 * Запрос рейтинга возраста с Shikimori (поле rating: none | g | pg | r | r_plus | rx).
 * Запуск: node scripts/fetch-shikimori-age-ratings.mjs > src/data/shikimoriAgeRatings.generated.json
 */

import https from 'https'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mockPath = path.join(__dirname, '../src/data/mockData.js')

const mockSource = readFileSync(mockPath, 'utf8')
const titleMatches = [...mockSource.matchAll(/title:\s*'([^']+)'/g)]
const titles = titleMatches.slice(0, 100).map((m) => m[1])

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'SoraMangaDiploma/1.0 (educational project)'
          }
        },
        (res) => {
          let data = ''
          res.on('data', (c) => {
            data += c
          })
          res.on('end', () => {
            try {
              resolve(JSON.parse(data))
            } catch (e) {
              reject(e)
            }
          })
        }
      )
      .on('error', reject)
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function pickBestMatch(query, list) {
  if (!Array.isArray(list) || !list.length) {
    return null
  }
  const q = query.toLowerCase().trim()
  const exact = list.find(
    (item) =>
      String(item.russian || '').toLowerCase() === q ||
      String(item.name || '').toLowerCase() === q
  )
  if (exact) {
    return exact
  }
  const partial = list.find(
    (item) =>
      String(item.russian || '').toLowerCase().includes(q) ||
      q.includes(String(item.russian || '').toLowerCase())
  )
  return partial || list[0]
}

const byId = {}
const meta = []

for (let i = 0; i < titles.length; i++) {
  const id = i + 1
  const title = titles[i]
  const q = encodeURIComponent(title)
  let rating = 'none'
  let shikiId = null
  let shikiRussian = null
  try {
    const list = await getJson(`https://shikimori.one/api/mangas?search=${q}&limit=8`)
    const best = pickBestMatch(title, list)
    if (best) {
      rating = best.rating || 'none'
      shikiId = best.id
      shikiRussian = best.russian || best.name
    }
  } catch (err) {
    process.stderr.write(`  ошибка ${title}: ${err.message}\n`)
  }
  byId[id] = rating
  meta.push({ id, title, rating, shikiId, shikiRussian })
  process.stderr.write(`${id}/${titles.length} ${title} → ${rating}\n`)
  await sleep(450)
}

const outJs = path.join(__dirname, '../src/data/shikimoriAgeRatings.js')
const body = `/**
 * Возрастной рейтинг Shikimori (rating): none, g, pg, r, r_plus, rx.
 * rx = 18+. Сгенерировано scripts/fetch-shikimori-age-ratings.mjs
 */
export const SHIKIMORI_AGE_RATING_BY_ID = ${JSON.stringify(byId, null, 2)}

export const SHIKIMORI_AGE_META = ${JSON.stringify(meta, null, 2)}
`
writeFileSync(outJs, body, 'utf8')
console.error(`Записано ${outJs}`)
