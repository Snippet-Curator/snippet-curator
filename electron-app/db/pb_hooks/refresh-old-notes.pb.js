onBootstrap((e) => {
  e.next()

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

  const daysOld = 0
  const cutoff = new Date(Date.now() - daysOld * 86400000).toISOString()
  const today = new Date(Date.now()).toISOString()

  const notes = arrayOf(
    new DynamicModel({
      id: '',
      title: '',
      last_opened: '',
      last_score_updated: '',
      weight: 0,
      score: 0,
      rating: 0
    })
  )

  e.app
    .db()
    .newQuery(
      'SELECT id, title, rating, weight, last_score_updated FROM notes WHERE last_score_updated < {:cutoff}'
    )
    .bind({
      cutoff: cutoff
    })
    .all(notes)

  for (const note of notes) {
    const newScore = calculateNoteScore(note.rating, note.weight, note.lastOpened)

    e.app
      .db()
      .newQuery(
        `UPDATE notes SET score = {:newScore}, last_score_updated = {:today} WHERE id = {:id}`
      )
      .bind({
        id: note.id,
        newScore: newScore,
        today: today
      })
      .execute()
  }

  console.log(`Updated scores for ${notes.length} notes`)
})
