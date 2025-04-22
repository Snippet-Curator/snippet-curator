import { getAuth } from '$lib/db.svelte'
import { makeDefaultNotebook } from '$lib/parser'

export async function load() {
  await getAuth()
  await makeDefaultNotebook()
}