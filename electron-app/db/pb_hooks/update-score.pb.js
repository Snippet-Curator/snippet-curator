onRecordUpdateRequest((e) => {
  const calculateNoteScore = require(`${__hooks}/utils.js`).calculateNoteScore
  const findSettingbyName = require(`${__hooks}/utils.js`).findSettingbyName

  let ratingWeight = findSettingbyName('ratingWeight')
  let recencyWeight = findSettingbyName('recencyWeight')
  let weightWeight = findSettingbyName('weightWeight')
  let randomWeight = findSettingbyName('randomWeight')
  let fullPenaltyWindow = findSettingbyName('fullPenaltyWindow')
  let decayWindow = findSettingbyName('decayWindow')

  if (
    !ratingWeight ||
    !recencyWeight ||
    !weightWeight ||
    !randomWeight ||
    !fullPenaltyWindow ||
    !decayWindow
  )
    return

  const rating = e.record.get('rating')
  const weight = e.record.get('weight')
  const lastOpened = e.record.get('last_opened')

  const recordScore = calculateNoteScore(
    rating,
    weight,
    lastOpened,
    ratingWeight,
    recencyWeight,
    weightWeight,
    randomWeight,
    fullPenaltyWindow,
    decayWindow
  )

  e.record.set('score', recordScore)
  e.next()
}, 'notes')
