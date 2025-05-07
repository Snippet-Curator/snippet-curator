onBootstrap((e) => {
  e.next()

  const calculateNoteScore = require(`${__hooks}/utils.js`).calculateNoteScore

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

  try {
    e.app
      .db()
      .newQuery(
        'SELECT id, title, rating, weight, last_score_updated FROM notes WHERE last_score_updated < {:cutoff}'
      )
      .bind({
        cutoff: cutoff
      })
      .all(notes)
  } catch (err) {
    console.error(`No notes found: ${err.message}`)
  }

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
