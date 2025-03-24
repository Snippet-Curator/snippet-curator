import { getAuth } from '$lib/db.svelte'

export async function load() {
  await getAuth()
}