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
    return 0.1 + Math.random() * 0.9
  }
  const daysAgo = (Date.now() - openedDate.getTime()) / (1000 * 60 * 60 * 24)

  // 100 day normalization. Increases more early on and then flattens
  return Math.min(1, Math.log(1 + daysAgo) / Math.log(1 + 100))
}

function findSettingbyName(name) {
  try {
    const record = $app.findFirstRecordByData('settings', 'name', name)
    return record.getFloat('value')
  } catch (e) {
    console.error('Error getting setting')
    return
  }
}

function recentlySeenPenalty(lastOpened, fullPenaltyWindow, decayWindow) {
  const openedDate = new Date(lastOpened)
  if (isNaN(openedDate.getTime())) return 1 // unrated → no penalty

  const hoursAgo = (Date.now() - openedDate.getTime()) / (1000 * 60 * 60)

  // Full penalty if seen within last hour, fades out over 12 hours
  const decayFactor = Math.min(fullPenaltyWindow, hoursAgo / decayWindow)
  // cap full penalty at 1%
  const adjustedDecay = Math.max(0.1, decayFactor)
  return adjustedDecay // 0 (just seen) → 1 (not seen in 12+ hours)
}

function calculateNoteScore(
  rating,
  weight,
  lastOpened,
  ratingWeight,
  recencyWeight,
  weightWeight,
  randomWeight,
  fullPenaltyWindow,
  decayWindow
) {
  const ratingNorm = normalizeRating(rating ?? 0, 1, 5)
  const recencyNorm = recencyScore(lastOpened ?? new Date())
  const weightNorm = normalizeWeight(weight ?? 0, 0, 10)
  const randomFactor = Math.random() < 0.05 ? 0.8 + Math.random() * 0.2 : Math.random() // 5% chance of random boost, otherwise random.

  const totalWt = ratingWeight + recencyWeight + weightWeight + randomWeight
  const rawScore =
    (ratingWeight * ratingNorm +
      recencyWeight * recencyNorm +
      weightWeight * weightNorm +
      randomWeight * randomFactor) /
    totalWt
  const score = rawScore * recentlySeenPenalty(lastOpened, fullPenaltyWindow, decayWindow) * 100
  return score
}

module.exports = {
  findSettingbyName,
  calculateNoteScore
}
