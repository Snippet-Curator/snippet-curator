import { getAuth } from '$lib/db'

export async function load() {
  await getAuth()
}