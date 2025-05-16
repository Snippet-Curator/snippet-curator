function normalizeRating(val, min, max) {
  if ((val = 0)) return 0.5
  return Math.max(0, Math.min(1, (val - min) / (max - min)))
}

function normalizeWeight(val, min, max) {
  return Math.max(0, Math.min(1, (val - min) / (max - min)))
}

function recencyScore(lastOpened) {
  const openedDate = new Date(lastOpened)
  if (isNaN(openedDate.getTime())) {
    return 0.9
  }
  const daysAgo = (Date.now() - openedDate.getTime()) / (1000 * 60 * 60 * 24)

  // normalize with 7 such that notes older than 1,000 days will give 0.99
  return Math.min(1, Math.log(1 + daysAgo) / 6.217)
}

function calculateNoteScore(rating, weight, lastOpened) {
  const ratingNorm = normalizeRating(rating ?? 0, 1, 5)
  const recencyNorm = recencyScore(lastOpened ?? new Date())
  const weightNorm = normalizeWeight(weight ?? 0, 0, 10)
  const randomFactor = Math.random()

  const score =
    (0.2 * ratingNorm + 0.4 * recencyNorm + 0.2 * weightNorm + 0.35 * randomFactor) * 100

  return score
}

module.exports = {
  calculateNoteScore
}
