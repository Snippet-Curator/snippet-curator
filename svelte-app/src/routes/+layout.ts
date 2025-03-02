import pb, { getAuth } from '$lib/db'

export async function load() {
  await getAuth()

  const notebooks = await pb.collection('notebooks').getFullList()
  const tags = await pb.collection('tags').getFullList({
    sort: 'name'
  })
  const notes = await pb.collection('notes').getList(1, 1)

  return {
    notebooks, tags, notes
  }
}