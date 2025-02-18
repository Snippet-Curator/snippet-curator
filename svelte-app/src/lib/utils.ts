import pb from '$lib/db'

export async function getNotesByPage(clickedPage: number, notebookID: string) {
  const notes = await pb.collection('notes').getList(clickedPage, 25, {
    filter: `notebook = "${notebookID}"`,
    expand: 'tags'
  });
  console.log('utils', notes)
  return notes
}

