import PocketBase from 'pocketbase'
import type { Notebook, Tag, Note, NoteRecord } from './types'
import { getContext, setContext } from 'svelte'
import { tryCatch } from './utils.svelte'

const pb = new PocketBase('http://127.0.0.1:8090')


export type NoteType = {
  type: 'tags' | 'notebooks' | 'default',
  id?: string
}

export async function getAuth() {
  await pb.collection('_superusers').authWithPassword('admin@pocketbase.com', 'amiodarone')
  console.log("Logged in to Pocket client: ", pb.authStore.isValid)
}

export class TagState {
  tags = $state<Tag[]>([])
  collectionName = 'tags'
  viewCollectionName = 'tags_with_note_counts'

  constructor() {
    $effect(() => {
      this.getAll()
      pb.collection('notes').subscribe('*', async () => {
        this.getAll()
      });
    })
  }

  async getAll() {
    const records = await pb.collection(this.viewCollectionName).getFullList({
      sort: 'name',
      expand: 'parent'
    })

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

  async createOnebyName(newName: string) {
    const { data, error } = await tryCatch(
      pb.collection(this.collectionName).create({
        'name': newName
      })
    )
    if (error) {
      console.error('Error while creating new tag: ', error)
    }
    console.log('new tag: ', data)
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

  async updateOnebyParent(recordID: string, parentTagID: string) {
    console.log('tagID: ', recordID)
    console.log('parentTag: ', parentTagID)
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(recordID, {
      'parent': parentTagID
    }))
    if (error) {
      console.error('Error while updating parent tag: ', error)
    }
    console.log('updated parent: ', data)
    await this.getAll()
  }
}


export class NotebookState {
  notebooks = $state<Notebook[]>([])
  collectionName = 'notebooks'
  viewCollectionName = 'notebooks_with_note_counts'

  constructor() {
    $effect(() => {
      this.getAll()
      pb.collection('notebooks').subscribe('*', async () => {
        this.getAll()
      });
      pb.collection('notes').subscribe('*', async () => {
        this.getAll()
      });
    })
  }

  async getAll() {
    const records = await pb.collection(this.viewCollectionName).getFullList({
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

  async createOnebyName(newName: string) {
    const { data, error } = await tryCatch(
      pb.collection(this.collectionName).create({
        'name': newName
      })
    )
    if (error) {
      console.error('Error while creating new notebook: ', error)
    }
    console.log('new notebook: ', data)
    await this.getAll()
  }

  async getOneByName() {
    return await pb.collection(this.collectionName).getFirstListItem(`name='${name}'`)
  }

  async delete(recordID: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).delete(recordID))

    if (error) {
      console.error('Error while deleting notebook: ', error)
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
      console.error('Error while updating notebook name: ', error)
    }
    await this.getAll()
  }

  async updateOnebyParent(recordID: string, parentNotebook: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(recordID, {
      'parent': parentNotebook
    }))
    if (error) {
      console.error('Error while updating parent notebook: ', error)
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
  notebookID = $state<string>()
  tagID = $state<string>()
  noteType = $state<'tags' | 'notebooks' | 'default'>()

  constructor(noteType: NoteType) {
    this.noteType = noteType.type
    if (this.noteType == 'notebooks') {
      this.notebookID = noteType.id
    } else if (this.noteType == 'tags') {
      this.tagID = noteType.id
    }
  }

  async getArchiveNotebook() {
    const { data, error } = await tryCatch(pb.collection('notebooks').getFirstListItem('name="Archive"'))

    if (error) {
      console.error('Error getting Archive Notebook: ', error)
      return pb.collection('notebooks').create({
        name: 'Archive'
      })
    }
    return data
  }

  async getDefault() {
    if (this.noteType == 'default') {
      this.getByPage()
    } else if (this.noteType == 'notebooks') {
      this.getByNotebook(this.notebookID)
    } else if (this.noteType == 'tags') {
      this.getByTag(this.tagID)
    }
  }

  async getByPage(sort = '-created') {
    const archiveNotebook = await this.getArchiveNotebook()
    const { data, error } = await tryCatch(pb.collection(this.collectionName).getList(this.clickedPage, 24, {
      sort: sort,
      filter: `notebook!="${archiveNotebook.id}"`,
    }))

    if (error) {
      console.error('Unable to get notes by page ', error)
    }

    this.notes = data
    return this.notes
  }

  async getByNotebook(notebookID: string) {
    console.log('notebookID', this.notebookID)
    const { data, error } = await tryCatch(pb.collection(this.collectionName).getList(this.clickedPage, 24, {
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

  async getByTag(tagID: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).getList(this.clickedPage, 24, {
      filter: `tags~"${tagID}"`,
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

  async deleteMultiple(recordIDs: string[]) {
    console.log('noteIDs ', recordIDs)
    for (const recordID of recordIDs) {
      const { data, error } = await tryCatch(pb.collection(this.collectionName).delete(recordID))

      if (error) {
        console.error('Unable to delete note: ', error)
      }
    }
    await this.getDefault()
  }



  async archiveMultiple(recordIDs: string[]) {
    console.log('noteIDs ', recordIDs)

    const archiveNotebook = await this.getArchiveNotebook()

    for (const recordID of recordIDs) {
      const { data, error } = await tryCatch(pb.collection(this.collectionName).update(recordID, {
        notebook: archiveNotebook.id
      }))

      if (error) {
        console.error('Unable to archive note: ', error)
      }
    }
    await this.getDefault()
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


export function setNoteState(NOTE_KEY: string, noteType: NoteType) {
  return setContext(NOTE_KEY, new NoteState(noteType))
}

export function getNoteState(NOTE_KEY: string) {
  return getContext<ReturnType<typeof setNoteState>>(NOTE_KEY)
}


