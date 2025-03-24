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
  const records = await pb.collection('notebooks').getFullList({
    sort: 'name',
    expand: 'parent'
  });

  const notebookMap = new Map()
  records.forEach(notebook => {
    notebookMap.set(notebook.id, { ...notebook, children: [] })
  })

  let rootNotebooks = []
  notebookMap.forEach(notebook => {
    if (notebook.expand.parent) {
      const parent = notebookMap.get(notebook.expand.parent.id)
      parent.children.push(notebook)
    } else {
      rootNotebooks.push(notebook)
    }
  })

  const notebooks = rootNotebooks
  return notebooks
}

export async function getTags() {
  const records = await pb.collection('tags').getFullList({
    sort: 'name',
    expand: 'parent'
  });

  const tagMap = new Map()
  records.forEach(tag => {
    tagMap.set(tag.id, { ...tag, children: [] })
  })

  let rootTags = []
  tagMap.forEach(tag => {
    if (tag.expand.parent) {
      const parent = tagMap.get(tag.expand.parent.id)
      parent.children.push(tag)
    } else {
      rootTags.push(tag)
    }
  })

  const tags = rootTags
  return tags
}

export async function deleteTag(recordID: string) {
  await pb.collection('tags').delete(recordID)
}

export async function subscribeToTag(tags) {
  pb.realtime.subscribe('tags', async function (event) {
    tags = await pb.collection('tags').getFullList({
      sort: 'name'
    });
  });
}

export async function subscribeToNotebook(notebooks) {
  pb.realtime.subscribe('notebooks', async function (event) {
    notebooks = await pb.collection('notebooks').getFullList({
      sort: 'name'
    });
  })
}


export default pb
