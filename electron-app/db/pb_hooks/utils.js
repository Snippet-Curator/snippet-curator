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

function recentlySeenPenalty(lastOpened) {
  const openedDate = new Date(lastOpened)
  if (isNaN(openedDate.getTime())) return 1 // unrated → no penalty

  const hoursAgo = (Date.now() - openedDate.getTime()) / (1000 * 60 * 60)

  // Full penalty if seen within last hour, fades out over 12 hours
  const decayFactor = Math.min(1, hoursAgo / 12)
  // cap full penalty at 1%
  const adjustedDecay = Math.max(0.1, decayFactor)
  return adjustedDecay // 0 (just seen) → 1 (not seen in 12+ hours)
}

function calculateNoteScore(rating, weight, lastOpened) {
  const ratingNorm = normalizeRating(rating ?? 0, 1, 5)
  const recencyNorm = recencyScore(lastOpened ?? new Date())
  const weightNorm = normalizeWeight(weight ?? 0, 0, 10)
  const randomFactor = Math.random()

  const rawScore =
    (0.3 * ratingNorm + 0.4 * recencyNorm + 0.25 * weightNorm + 0.15 * randomFactor) / 1.1
  const score = rawScore * recentlySeenPenalty(lastOpened) * 100
  return score
}

module.exports = {
  calculateNoteScore
}
