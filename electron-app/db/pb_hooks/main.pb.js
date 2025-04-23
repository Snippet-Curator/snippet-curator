function normalize(val, min, max) {
  return (val - min) / (max - min)
}

function recencyScore(lastOpened) {
  const days = (Date.now() - new Date(lastOpened).getTime()) / (1000 * 60 * 60 * 24)
  return 1 / (1 + days)
}

pb.collection('notes').beforeUpdate(async ({ record }) => {
  const ratingNorm = normalize(record.rating, 1, 5)
  const recencyNorm = recencyScore(record.lastOpened)
  const weightNorm = normalize(record.weight, 0, 10)

  record.score = 0.4 * ratingNorm + 0.4 * recencyNorm + 0.2 * weightNorm
})
