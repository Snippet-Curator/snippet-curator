onRecordUpdateRequest((e) => {
  const calculateNoteScore = require(`${__hooks}/utils.js`).calculateNoteScore

  const rating = e.record.get('rating')
  const weight = e.record.get('weight')
  const lastOpened = e.record.get('last_opened')

  const recordScore = calculateNoteScore(rating, weight, lastOpened)

  e.record.set('score', recordScore)
  e.next()
}, 'notes')
