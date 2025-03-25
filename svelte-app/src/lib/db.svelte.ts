import PocketBase from 'pocketbase'
import type { Notebook, Tag, Note } from './types'
import { getContext, setContext } from 'svelte'

const pb = new PocketBase('http://127.0.0.1:8090')


export async function getAuth() {
  await pb.collection('_superusers').authWithPassword('admin@pocketbase.com', 'amiodarone')
  console.log("Logged in to Pocket client: ", pb.authStore.isValid)
}

export class TagState {
  tags = $state<Tag[]>([])
  collectionName = 'tags'

  constructor() {
    $effect(() => {
      this.getAll()
    })
  }

  async getAll() {
    const records = await pb.collection(this.collectionName).getFullList({
      sort: 'name',
      expand: 'parent,notes_via_tags'
    });

    const tagMap = new Map()
    records.forEach(tag => {
      tagMap.set(tag.id, { ...tag, children: [] })
    })

    let rootTags: Tag[] = []
    tagMap.forEach(tag => {
      if (tag.expand.parent) {
        const parent = tagMap.get(tag.expand.parent.id)
        parent.children.push(tag)
      } else {
        rootTags.push(tag)
      }
    })

    this.tags = rootTags
  }

  async delete(recordID: string) {
    await pb.collection(this.collectionName).delete(recordID)
    await this.getAll()
  }

  async updateOne(recordID: string, newName: string, parentTag: string) {
    if (parentTag && newName) {
      await pb.collection(this.collectionName).update(recordID, {
        'name': newName,
        'parent': parentTag
      })
    }
    else if (newName) {
      await pb.collection(this.collectionName).update(recordID, {
        'name': newName
      })
    }
    else if (parentTag) {
      await pb.collection(this.collectionName).update(recordID, {
        'parent': parentTag
      })
    }
    await this.getAll()
  }
}


export class NotebookState {
  notebooks = $state<Notebook[]>([])
  collectionName = 'notebooks'

  constructor() {
    $effect(() => {
      this.getAll()
    })
  }

  async getAll() {
    const records = await pb.collection(this.collectionName).getFullList({
      sort: 'name',
      expand: 'parent'
    });

    const notebookMap = new Map()
    records.forEach(notebook => {
      notebookMap.set(notebook.id, { ...notebook, children: [] })
    })

    let rootNotebooks: Notebook[] = []
    notebookMap.forEach(notebook => {
      if (notebook.expand.parent) {
        const parent = notebookMap.get(notebook.expand.parent.id)
        parent.children.push(notebook)
      } else {
        rootNotebooks.push(notebook)
      }
    })

    this.notebooks = rootNotebooks
  }

  async getOneByName() {
    return await pb.collection(this.collectionName).getFirstListItem(`name='${name}'`)
  }

  async delete(recordID: string) {
    await pb.collection(this.collectionName).delete(recordID)
    await this.getAll()
  }

  async updateOne(recordID: string, newName: string, parentNotebook: string) {
    if (parentNotebook && newName) {
      await pb.collection(this.collectionName).update(recordID, {
        'name': newName,
        'parent': parentNotebook
      })
    }
    else if (newName) {
      await pb.collection(this.collectionName).update(recordID, {
        'name': newName
      })
    }
    else if (parentNotebook) {
      await pb.collection(this.collectionName).update(recordID, {
        'parent': parentNotebook
      })
    }
    await this.getAll()
  }
}

export class NoteState {
  notes = $state<Note[]>([])
  collectionName = 'notes'

  constructor() {
    $effect(() => {
      this.getAll()
    })
  }

  async getAll() {
    const records = await pb.collection(this.collectionName).getFullList({
      sort: 'name',
      expand: 'parent'
    });

    const notebookMap = new Map()
    records.forEach(notebook => {
      notebookMap.set(notebook.id, { ...notebook, children: [] })
    })

    let rootNotebooks: Notebook[] = []
    notebookMap.forEach(notebook => {
      if (notebook.expand.parent) {
        const parent = notebookMap.get(notebook.expand.parent.id)
        parent.children.push(notebook)
      } else {
        rootNotebooks.push(notebook)
      }
    })

    this.notebooks = rootNotebooks
  }

  async getOneByName() {
    return await pb.collection(this.collectionName).getFirstListItem(`name='${name}'`)
  }

  async delete(recordID: string) {
    await pb.collection(this.collectionName).delete(recordID)
    await this.getAll()
  }

  async updateOne(recordID: string, newName: string, parentNotebook: string) {
    if (parentNotebook && newName) {
      await pb.collection(this.collectionName).update(recordID, {
        'name': newName,
        'parent': parentNotebook
      })
    }
    else if (newName) {
      await pb.collection(this.collectionName).update(recordID, {
        'name': newName
      })
    }
    else if (parentNotebook) {
      await pb.collection(this.collectionName).update(recordID, {
        'parent': parentNotebook
      })
    }
    await this.getAll()
  }
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


export default pb

const TAG_KEY = Symbol('TAG')
const NOTEBOOK_KEY = Symbol('NOTEBOOK')
const NOTE_KEY = Symbol('NOTE')

export function setTagState() {
  return setContext(TAG_KEY, new TagState())
}

export function getTagState() {
  return getContext<ReturnType<typeof setTagState>>(TAG_KEY)
}

export function setNotebookState() {
  return setContext(NOTEBOOK_KEY, new NotebookState())
}

export function getNotebookState() {
  return getContext<ReturnType<typeof setNotebookState>>(NOTEBOOK_KEY)
}

export function setNoteState() {
  return setContext(NOTE_KEY, new NotebookState())
}

export function getNoteState() {
  return getContext<ReturnType<typeof setNoteState>>(NOTE_KEY)
}


