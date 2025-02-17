import pb from '$lib/db'
import type { Note } from '$lib/types'

export async function load({ params }) {
  const notebookID = params.slug
  const notebook = await pb.collection('notebooks').getOne(notebookID)

  return {
    notebook
  }
}