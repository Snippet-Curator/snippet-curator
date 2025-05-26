import PocketBase, { type RecordModel } from 'pocketbase'
import { type Notebook, type Tag, type Note, type NoteRecord, type PError } from './types'
import { getContext, setContext } from 'svelte'
import { tryCatch } from './utils.svelte'

export const pbURL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'
const pb = new PocketBase(pbURL)

export type NoteType = {
  type: 'tags' | 'notebooks' | 'default',
  id?: string
}

export function replacePbUrl(content: string) {
  if (pbURL == 'http://127.0.0.1:8090') return content
  return content.replace(/http:\/\/127\.0\.0\.1:8090/g, pbURL)
}

export async function getAuth() {
  await pb.collection('_superusers').authWithPassword('admin@pocketbase.com', 'amiodarone')
  console.log("Logged in to Pocket client: ", pb.authStore.isValid)
}

async function getArchiveNotebook() {
  const { data, error } = await tryCatch(pb.collection('notebooks').getFirstListItem('name="Archive"'))

  if (error) {
    console.log('Error getting Archive Notebook: ', error.message)
    // return pb.collection('notebooks').create({
    //   name: 'Archive'
    // })
  }
  return data
}

async function getTrashNotebook() {
  const { data, error } = await tryCatch(pb.collection('notebooks').getFirstListItem('name="Trash"'))

  if (error) {
    console.error('Error getting Trash Notebook: ', error.message)
    // return pb.collection('notebooks').create({
    //   name: 'Trash'
    // })
  }
  return data
}

export class TagState {
  tags = $state<Tag[]>([])
  collectionName = 'tags'
  viewCollectionName = 'tags_with_note_counts'
  flatTags = $state<Tag[]>([])

  constructor() {
    $effect(() => {
      this.getAll()
      pb.collection('notes').subscribe('*', async () => {
        this.getAll()
      });
    })
  }

  async getAll() {
    // const start = performance.now()
    const { data: records, error } = await tryCatch(pb.collection(this.viewCollectionName).getFullList({
      sort: 'name',
      expand: 'parent'
    }))


    if (error) {
      console.error('Error while getting all tags: ', error.message)
    }

    if (!records) {
      return
    }
    // const mid = performance.now()
    // console.log(`after db: ${mid - start} ms`)

    this.flatTags = records

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

    // const end = performance.now()
    // console.log('tags updated in: ', end - start, 'ms')
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
      console.error('Error while creating new tag: ', error.data)
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
      console.error('Error while updating tag name: ', error.message, error.data)
    }
    await this.getAll()
  }

  async updateOnebyParent(recordID: string, parentTagID: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(recordID, {
      'parent': parentTagID
    }))
    if (error) {
      console.error('Error while updating parent tag: ', error.message)
    }
    await this.getAll()
  }
}

export class NotebookState {
  collectionName = 'notebooks'
  viewCollectionName = 'notebooks_with_note_counts'
  notebooks = $state<Notebook[]>([])
  flatNotebooks = $state<Notebook[]>([])

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
    // const start = performance.now()
    const { data: records, error } = await tryCatch(pb.collection(this.viewCollectionName).getFullList({
      sort: 'name',
      filter: 'name != "Inbox" && name != "Archive" && name != "Trash"',
      expand: 'parent'
    }))

    if (error) {
      console.error('Error while get all notebooks: ', error.message)
    }

    if (!records) {
      return
    }

    this.flatNotebooks = records

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
    // const end = performance.now()
    // console.log(`notebooks in ${end - start} ms`)
    this.notebooks = rootNotebooks
  }

  async createOnebyName(newName: string) {
    const { data, error } = await tryCatch(
      pb.collection(this.collectionName).create({
        'name': newName
      })
    )
    if (error) {
      console.error('Error while creating new notebook: ', error.data, error.message)
    }
    await this.getAll()
  }

  async getOneByName(notebookName: string) {

    const { data, error } = await tryCatch(pb.collection(this.viewCollectionName).getFirstListItem(`name="${notebookName}"`))

    if (error) {
      console.error('Error while get notebook: ', notebookName, error.data)
    }
    return data
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

export class defaultNotebooksState {
  inbox = $state<Note>()
  inboxID = $state<string>('')
  inboxCount = $state<number>(0)
  archive = $state<Note>()
  archiveID = $state<string>('')
  archiveCount = $state<number>(0)
  trash = $state<Note>()
  trashID = $state<string>('')
  trashCount = $state<number>(0)
  totalNoteCount = $state<number>(0)
  viewCollectionName = 'notebooks_with_note_counts'

  constructor() {
    $effect(() => {
      pb.collection('notebooks').subscribe('*', async () => {
        this.getAll()
        this.getAllCounts()
      });
      pb.collection('notes').subscribe('*', async () => {
        this.getAll()
        this.getAllCounts()
      });
    })
  }

  async getAll() {

    const { data: inbox, error } = await tryCatch(pb.collection(this.viewCollectionName).getFirstListItem(`name="Inbox"`))

    if (error) {
      console.error('Error while getting inbox: ', error.message)
    }

    const { data: archive, error: archiveError } = await tryCatch(pb.collection(this.viewCollectionName).getFirstListItem(`name="Archive"`))

    if (archiveError) {
      console.error('Error while getting Archive: ', archiveError.message)
    }

    const { data: trash, error: trashError } = await tryCatch(pb.collection(this.viewCollectionName).getFirstListItem(`name="Trash"`))

    if (trashError) {
      console.error('Error while getting Trash: ', trashError.message)
    }

    if (!inbox || !archive || !trash) {
      return
    }

    this.inbox = inbox
    this.inboxCount = inbox.note_count
    this.inboxID = inbox.id

    this.archive = archive
    this.archiveCount = archive.note_count
    this.archiveID = archive.id

    this.trash = trash
    this.trashCount = trash.note_count
    this.trashID = trash.id

  }

  async getAllCounts() {
    const { data, error } = await tryCatch(pb.collection(this.viewCollectionName).getFullList({
      filter: 'name != "Trash"',
    }))

    if (error) {
      console.error('Error while getting all notebooks: ', error.message)
    }

    this.totalNoteCount = data.reduce((total: number, current: { note_count: number }) => {
      return current.note_count + total
    }, 0)
  }
}

export class NotelistState {
  notes = $state<NoteRecord>({
    items: [],
    page: 1,
    perPage: 25,
    totalItems: 0,
    totalPages: 0,
  })
  clickedPage = 1
  collectionName = 'notes'
  viewCollectionName = 'notes_without_content'
  notebookID = $state<string>()
  notebookName = $state<string>()
  tagID = $state<string>()
  noteType = $state<'tags' | 'notebooks' | 'default'>()
  tags = $state<Tag[]>()

  constructor(noteType: NoteType) {
    this.noteType = noteType.type
    if (this.noteType == 'notebooks') {
      this.notebookID = noteType.id
    } else if (this.noteType == 'tags') {
      this.tagID = noteType.id
    }
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

  async getCurrentNotebook(notebookID: string) {
    const { data, error } = await tryCatch(pb.collection('notebooks').getOne(notebookID))

    if (error) {
      console.error('Error getting notebook: ', error)
    }
    return data
  }

  async getByPage(sort = '-created') {
    const archiveNotebook = await getArchiveNotebook()
    const trashNotebook = await getTrashNotebook()

    if (!archiveNotebook || !trashNotebook) return

    const { data, error } = await tryCatch(pb.collection(this.viewCollectionName).getList(this.clickedPage, 24, {
      sort: sort,
      filter: `notebook!="${archiveNotebook.id}" && notebook!="${trashNotebook.id}"`,
      expand: 'notebook, tags'
    }))

    if (error) {
      console.error('Unable to get notes by page ', error)
    }

    this.notes = data
    return this.notes
  }

  async getByNotebook(notebookID: string) {
    const { data, error } = await tryCatch(pb.collection(this.viewCollectionName).getList(this.clickedPage, 24, {
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
    const archiveNotebook = await getArchiveNotebook()
    const trashNotebook = await getTrashNotebook()
    const { data, error } = await tryCatch(pb.collection(this.viewCollectionName).getList(this.clickedPage, 24, {
      filter: `tags~"${tagID}" && notebook!="${archiveNotebook.id}" && notebook!="${trashNotebook.id}"`,
      expand: 'tags,notebook',
      sort: '-created',
    }))

    if (error) {
      console.error('Error getting notes: ', error)
    }
    this.notes = data
    return this.notes
  }

  async getByFilter(sort = '-updated', customFilters: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).getList(this.clickedPage, 24, {
      sort: sort,
      expand: 'tags,notebook',
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

  async emptyTrash() {
    const trashNotebook = await getTrashNotebook()

    const { data, error } = await tryCatch(pb.collection(this.collectionName).getFullList({
      filter: `notebook="${trashNotebook.id}"`,
    }))

    if (error) {
      console.error('Unable to delete note: ', error)
    }

    if (!data) return

    await Promise.all(data.map(note => {
      pb.collection(this.collectionName).delete(note.id)
    }))
  }

  async softDeleteMultiple(recordIDs: string[]) {
    const trashNotebook = await getTrashNotebook()

    await Promise.all(recordIDs.map(async recordID => {
      const { data, error } = await pb.collection(this.collectionName).update(recordID, {
        notebook: trashNotebook.id
      })

      if (error) {
        console.error('Unable to delete note: ', error)
      }
    }))
    await this.getDefault()
  }

  async archiveMultiple(recordIDs: string[]) {
    const archiveNotebook = await getArchiveNotebook()

    await Promise.all(recordIDs.map(async recordID => {
      const { data, error } = await pb.collection(this.collectionName).update(recordID, {
        notebook: archiveNotebook.id
      })

      if (error) {
        console.error('Unable to archive note: ', error)
      }
    }))
    await this.getDefault()
  }

  async changeNotebook(selectedNotesID: string[], newNotebookID: string) {
    await Promise.all(selectedNotesID.map(async noteID => {
      const { data, error } = await tryCatch(pb.collection(this.collectionName).update(noteID, {
        notebook: newNotebookID
      }))
      if (error) {
        console.error('Error changing notebook: ', noteID, error)
      }
    }))
    await this.getDefault()
  }

  async changeTags(selectedNotesID: string[], selectedTags: string[]) {
    await Promise.all(selectedNotesID.map(async noteID => {
      const { data, error } = await tryCatch(pb.collection(this.collectionName).update(noteID, {
        tags: selectedTags
      }))
      if (error) {
        console.error('Error changing tags: ', noteID, error)
      }
    }))
    await this.getDefault()
  }

  async getTags(selectedNotesID: string[]) {
    let tagList: Tag[] = []
    await Promise.all(selectedNotesID.map(async noteID => {
      const { data, error } = await tryCatch<Note, PError>(pb.collection(this.viewCollectionName).getOne(noteID, {
        expand: 'tags'
      }))
      if (error) {
        console.error('Error getting tag: ', noteID, error)
        return
      }
      const tags = data.expand?.tags ?? []
      if (tags.length === 0) return
      tagList.push(...tags)
    }))
    const uniqueTags = Object.values(
      Object.fromEntries(tagList.map(tag => [tag.id, tag]))
    )
    this.tags = uniqueTags
  }

  async addAllTags(selectedNotesID: string[], selectedTagsID: string[]) {
    await Promise.all(selectedNotesID.map(async noteID => {
      const { data, error } = await tryCatch(pb.collection(this.collectionName).update(noteID, {
        'tags+': selectedTagsID
      }))
      if (error) {
        console.error('Error adding tag: ', noteID, error)
      }
    }))
    await this.getDefault()
  }

  async clearTags(selectedNotesID: string[]) {
    await Promise.all(selectedNotesID.map(async noteID => {
      const { data, error } = await tryCatch(pb.collection(this.collectionName).update(noteID, {
        'tags': []
      }))
      if (error) {
        console.error('Error clearing tags: ', noteID, error)
      }
    }))
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

export class NoteState {
  note = $state<Note>()
  noteList = $state()
  noteID: string
  collectionName: string
  viewCollectionName: string

  constructor(noteID: string) {
    this.noteID = noteID
    this.collectionName = 'notes'
    this.viewCollectionName = 'notes_without_content'
  }

  async getNote() {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).getOne(this.noteID, {
      expand: 'notebook,tags'
    }))

    if (error) {
      console.error('Error getting note: ', this.noteID, error)
      return null
    }
    this.note = data
    return data
  }

  async getDiscoverNoteList(page = 1) {
    const { data, error } = await tryCatch(pb.collection(this.viewCollectionName).getList(page, 100, {
      expand: 'notebook,tags',
      sort: '-score'
    }))

    if (error) {
      console.error('Error getting discover note: ', error.data)
    }

    this.noteList = data
    return data
  }

  async getDiscoverNote(index = 0) {
    this.noteID = this.noteList.items[index].id

    const { data: record, error: recordError } = await tryCatch(pb.collection(this.collectionName).getFirstListItem(`id="${this.noteID}"`, {
      expand: 'notebook,tags',
    }))

    if (recordError) {
      console.error('Error getting discover note: ', recordError.data)
    }

    if (!record) {
      console.log('No discovery note found')
    }

    this.note = record

    this.updateLastOpened()

  }

  async updateLastOpened() {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.noteID, {
      last_opened: new Date(),
    }))

    if (error) {
      console.error('Error updating note last opened date: ', error.message)
    }
  }

  async deleteNote() {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).delete(this.note.id))
    if (error) {
      console.error('Error deleting note: ', this.note.id, error)
    }
  }

  async softDeleteNote() {
    const trashNotebook = await getTrashNotebook()

    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.note.id, {
      notebook: trashNotebook.id
    }))

    if (error) {
      console.error('Unable to delete note: ', error)
    }
  }

  async changeNotebook(newNotebookID: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.noteID, {
      notebook: newNotebookID
    }))
    if (error) {
      console.error('Error changing notebook: ', this.noteID, error)
    }
    await this.getNote()
    return data
  }

  async changeTags(selectedTags: string[]) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.noteID, {
      tags: selectedTags
    }))
    if (error) {
      console.error('Error changing tags: ', this.noteID, error)
    }
    await this.getNote()
    // return data
  }

  async addTag(selectedTagID: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.noteID, {
      'tags+': selectedTagID
    }))
    if (error) {
      console.error('Error adding tag: ', this.noteID, error)
    }
    await this.getNote()
  }

  async removeTag(selectedTagID: string) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.noteID, {
      'tags-': selectedTagID
    }))
    if (error) {
      console.error('Error removing tag: ', this.noteID, error)
    }
    await this.getNote()
  }

  async changeRating(newRating: number) {
    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.noteID, {
      rating: newRating
    }))
    if (error) {
      console.error('Error changing rating: ', this.noteID, error.message)
    }
    await this.getNote()
    return data
  }

  async upvoteWeight() {
    const newWeight = this.note.weight + 1

    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.noteID, {
      weight: newWeight
    }))
    if (error) {
      console.error('Error changing weight: ', this.noteID, error.message)
    }
    await this.getNote()
    return data
  }

  async downvoteWeight() {
    const newWeight = this.note.weight - 1

    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.noteID, {
      weight: newWeight
    }))
    if (error) {
      console.error('Error changing weight: ', this.noteID, error.message)
    }
    await this.getNote()
    return data
  }

  async archiveNote() {
    const archiveNotebook = await getArchiveNotebook()

    const { data, error } = await tryCatch(pb.collection(this.collectionName).update(this.note.id, {
      notebook: archiveNotebook.id
    }))

    if (error) {
      console.error('Unable to archive note: ', error)
    }
  }
}



export default pb

const TAG_KEY = Symbol('TAG')
const NOTEBOOK_KEY = Symbol('NOTEBOOK')
const INBOX_KEY = Symbol('INBOX')

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


export function setNotelistState(NOTE_KEY: string, noteType: NoteType) {
  return setContext(NOTE_KEY, new NotelistState(noteType))
}

export function getNotelistState(NOTE_KEY: string) {
  return getContext<ReturnType<typeof setNotelistState>>(NOTE_KEY)
}

export function setNoteState(NOTE_KEY: string) {
  return setContext(NOTE_KEY, new NoteState(NOTE_KEY))
}

export function getNoteState(NOTE_KEY: string) {
  return getContext<ReturnType<typeof setNoteState>>(NOTE_KEY)
}

export function setDefaultNotebooksState() {
  return setContext(INBOX_KEY, new defaultNotebooksState())
}

export function getDefaultNotebooksState() {
  return getContext<ReturnType<typeof setDefaultNotebooksState>>(INBOX_KEY)
}



