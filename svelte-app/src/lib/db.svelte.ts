import PocketBase from 'pocketbase'
import type { Notebook, Tag, Note, NoteRecord } from './types'
import { getContext, setContext } from 'svelte'
import { tryCatch } from './utils.svelte'
import { goto } from '$app/navigation'

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
    const { data, error } = await tryCatch(pb.collection(this.collectionName).delete(recordID))

    if (error) {
      console.error('Error while deleting tag: ', error)
    }

    await this.getAll()
  }

  async updateOnebyName(recordID: string, newName: string) {
    const { data, error } = await tryCatch(
      pb.collection(this.collectionName).update(recordID, {
        'name': newName
      })
    )
    if (error) {
      console.error('Error while updating tag name: ', error)
    }
    await this.getAll()
  }

  async updateOnebyParent(recordID: string, parentTag: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(recordID, {
      'parent': parentTag
    }))
    if (error) {
      console.error('Error while updating parent tag: ', error)
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
  notes = $state<NoteRecord>({
    items: [],
    page: 1,
    perPage: 25,
    totalItems: 0,
    totalPages: 0,
  })
  clickedPage = 1
  collectionName = 'notes'

  constructor() {
  }

  async getByPage(sort = '-created') {
    console.log('getbypage ', this.clickedPage)
    const { data, error } = await tryCatch(pb.collection(this.collectionName).getList(this.clickedPage, 24, {
      sort: sort,
    }))

    if (error) {
      console.error('Unable to get notes by page ', error)
    }

    this.notes = data
    return this.notes
  }

  async getByNotebook(notebookID: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).getList(this.clickedPage, 25, {
      filter: `notebook="${notebookID}"`,
      expand: 'tags,notebook',
      sort: '-created',
    }))

    if (error) {
      console.error('Error getting notes: ', error)
    }
    this.notes = data
    return this.notes
  }

  async getByFilter(sort = '-updated', customFilters) {
    console.log('getbyfilter ', this.clickedPage)
    const { data, error } = await tryCatch(pb.collection(this.collectionName).getList(this.clickedPage, 24, {
      sort: sort,
      filter: customFilters
    }))

    if (error) {
      console.error('Unable to get notes by filter ', error)
    }

    this.notes = data
    return this.notes
  }

  async getOneByName() {
    return await pb.collection(this.collectionName).getFirstListItem(`name='${name}'`)
  }

  async delete(recordID: string) {
    await pb.collection(this.collectionName).delete(recordID)
    await this.getAll()
    goto('#/');
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

export function setNoteState(NOTE_KEY: string) {
  return setContext(NOTE_KEY, new NoteState())
}

export function getNoteState(NOTE_KEY: string) {
  return getContext<ReturnType<typeof setNoteState>>(NOTE_KEY)
}


