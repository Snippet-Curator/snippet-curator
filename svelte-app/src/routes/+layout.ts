import pb, { getAuth } from '$lib/db'

export async function load() {
  await getAuth()

  const notebooks = await pb.collection('notebooks').getFullList()
  const tags = await pb.collection('tags').getFullList()

  return {
    notebooks, tags
  }
}