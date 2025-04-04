import pb, { NoteState } from '$lib/db.svelte'
import type { Note } from '$lib/types'

export async function load({ params }): Promise<Note> {
  const noteID = params.slug
  const noteState = new NoteState(noteID)
  await noteState.getNote()
  return {
    noteState
  }
}
