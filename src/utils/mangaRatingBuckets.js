/** Детерминированное распределение голосов 1–10 вокруг среднего (как «облако» оценок). */
export function buildInitialBuckets(mean, totalVotes = 12000) {
  const m = Math.min(10, Math.max(1, mean))
  const sigma = 1.05 + (10 - m) * 0.04
  const weights = []
  for (let star = 1; star <= 10; star++) {
    weights.push(Math.exp(-((star - m) ** 2) / (2 * sigma * sigma)))
  }
  const sumW = weights.reduce((a, b) => a + b, 0)
  const floats = weights.map((w) => (w / sumW) * totalVotes)
  const counts = floats.map((f) => Math.floor(f))
  let rem = totalVotes - counts.reduce((a, b) => a + b, 0)
  let idx = Math.max(0, Math.min(9, Math.round(m) - 1))
  while (rem > 0) {
    counts[idx] += 1
    rem -= 1
    idx = (idx + 1) % 10
  }
  return counts
}

export function bucketsMean(counts) {
  const total = counts.reduce((a, b) => a + b, 0)
  if (!total) {
    return 0
  }
  let s = 0
  for (let i = 0; i < 10; i++) {
    s += (i + 1) * counts[i]
  }
  return s / total
}

export function barColorForStar(star) {
  if (star >= 9) {
    return 'linear-gradient(90deg,#22c55e,#4ade80)'
  }
  if (star >= 7) {
    return 'linear-gradient(90deg,#84cc16,#bef264)'
  }
  if (star >= 5) {
    return 'linear-gradient(90deg,#eab308,#fde047)'
  }
  if (star >= 3) {
    return 'linear-gradient(90deg,#fb923c,#fdba74)'
  }
  return 'linear-gradient(90deg,#ef4444,#f87171)'
}
