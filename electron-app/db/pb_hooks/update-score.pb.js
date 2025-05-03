onRecordUpdateRequest((e) => {
  function normalize(val, min, max) {
    return Math.max(0, Math.min(1, (val - min) / (max - min)))
  }

  function recencyScore(lastOpened) {
    const openedDate = new Date(lastOpened)
    if (isNaN(openedDate.getTime())) {
      return 0.5
    }
    const daysAgo = (Date.now() - openedDate.getTime()) / (1000 * 60 * 60 * 24)

    // normalize with 7 such that notes older than 1,000 days will give 0.99
    return Math.min(1, Math.log(1 + daysAgo) / 7)
  }

  function calculateNoteScore(rating, weight, lastOpened) {
    const ratingNorm = normalize(rating ?? 0, 1, 5)
    const recencyNorm = recencyScore(lastOpened ?? new Date())
    const weightNorm = normalize(weight ?? 0, 0, 10)
    const randomFactor = Math.random()

    const score =
      (0.25 * ratingNorm + 0.6 * recencyNorm + 0.25 * weightNorm + 0.2 * randomFactor) * 100

    return score
  }

  const rating = e.record.get('rating')
  const weight = e.record.get('weight')
  const lastOpened = e.record.get('last_opened')

  const recordScore = calculateNoteScore(rating, weight, lastOpened)

  e.record.set('score', recordScore)
  e.next()
}, 'notes')
