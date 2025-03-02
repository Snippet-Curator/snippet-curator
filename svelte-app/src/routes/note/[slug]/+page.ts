import pb from '$lib/db'
import type { Note } from '$lib/types'

export async function load({ params }): Promise<Note> {
  const noteID = params.slug
  const note = await pb.collection('notes').getOne(noteID, {
    expand: 'notebook, tags'
  })

  return {
    note
  }
}