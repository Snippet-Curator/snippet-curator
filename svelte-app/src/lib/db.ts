import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')


export async function getAuth() {
  await pb.collection('_superusers').authWithPassword('admin@pocketbase.com', 'amiodarone')
  console.log("Logged in to Pocket client: ", pb.authStore.isValid)
}

export async function getNotes(notebook: string) {
  if (notebook == '') {
    const notes = await pb.collection('notes').getList(1, 50, {
      expand: 'notebook'
    })
    return notes
  }

  const notes = await pb.collection('notes').getList(1, 50, {
    filter: `notebook == ${notebook}`,
    expand: 'notebook'
  })

  return notes
}

export async function getNotebook(name: string) {
  const notebook = await pb.collection('notebooks').getFirstListItem(`name='${name}'`)
  return notebook
}

export async function getNotebooks() {
  return await pb.collection('notebooks').getFullList({
    sort: 'name'
  });
}

export async function getTags() {
  return await pb.collection('tags').getFullList({
    sort: 'name'
  });
}

export default pb
