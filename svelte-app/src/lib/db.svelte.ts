import PocketBase, { type RecordModel } from 'pocketbase'
import { type Notebook, type Tag, type Note, type NoteRecord, type PError, type Setting } from './types';
import { getContext, setContext } from 'svelte'
import { tryCatch } from './utils.svelte'

export const pbURL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'
const pb = new PocketBase(pbURL)
const notebooksCollection = 'notebooks'
const notesCollection = 'notes'
const tagsCollection = 'tags'
const viewTagsCollectionName = 'tags_with_note_counts'
const viewNotesCollection = 'notes_without_content'
const viewNotebooksCollection = 'notebooks_with_note_counts'
const settingCollection = 'settings'

const superUser = 'admin@pocketbase.com'
const superUserPass = 'amiodarone'

export type NoteType = {
    type: 'tags' | 'notebooks' | 'default' | 'archive' | 'trash',
    id?: string
}

export function replacePbUrl(content: string) {
    if (pbURL == 'http://127.0.0.1:8090') return content
    return content.replace(/http:\/\/127\.0\.0\.1:8090/g, pbURL)
}

export async function getAuth() {
    await pb.collection('_superusers').authWithPassword(superUser, superUserPass)
    console.log("Logged in to Pocket client: ", pb.authStore.isValid)
}

export class TagState {
    tags = $state<Tag[]>([])
    flatTags = $state<Tag[]>([])

    constructor() {
        $effect(() => {
            this.getAll()
            pb.collection(notesCollection).subscribe('*', async () => {
                this.getAll()
            });
        })
    }

    async getAll() {
        // const start = performance.now()
        const { data: records, error } = await tryCatch(pb.collection(viewTagsCollectionName).getFullList({
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
        const { data, error } = await tryCatch(pb.collection(tagsCollection).delete(recordID))

        if (error) {
            console.error('Error while deleting tag: ', error)
        }

        await this.getAll()
    }

    async getOne(tagID: string) {
        const { data, error } = await tryCatch(pb.collection(tagsCollection).getOne(tagID))

        if (error) {
            console.error('Error getting tag: ', error)
        }

        return data
    }

    async createOnebyName(newName: string, parentTagID?: string) {
        const { data, error } = await tryCatch(
            pb.collection(tagsCollection).create({
                'name': newName,
                'parent': parentTagID
            })
        )
        if (error) {
            console.error('Error while creating new tag: ', error.data)
        }
        await this.getAll()
        return data
    }

    async updateOnebyName(recordID: string, newName: string) {
        const { data, error } = await tryCatch(
            pb.collection(tagsCollection).update(recordID, {
                'name': newName
            })
        )
        if (error) {
            console.error('Error while updating tag name: ', error.message, error.data)
        }
        await this.getAll()
    }

    async updateOnebyParent(recordID: string, parentTagID: string) {
        const { data, error } = await tryCatch(pb.collection(tagsCollection).update(recordID, {
            'parent': parentTagID
        }))
        if (error) {
            console.error('Error while updating parent tag: ', error.message)
        }
        await this.getAll()
    }
}

export class NotebookState {
    inbox = $state<Note>()
    inboxID = $state<string>('')
    inboxCount = $state(0)
    totalNoteCount = $state(0)
    notebooks = $state<Notebook[]>([])
    flatNotebooks = $state<Notebook[]>([])

    constructor() {
        $effect(() => {
            this.getAll()
            pb.collection(notebooksCollection).subscribe('*', async () => {
                this.getAll()
                this.getInbox()
                this.getAllCounts()
            });
            pb.collection(notesCollection).subscribe('*', async () => {
                this.getAll()
                this.getInbox()
                this.getAllCounts()
            });
        })
    }

    async getAll() {
        // const start = performance.now()
        const { data: records, error } = await tryCatch(pb.collection(viewNotebooksCollection).getFullList({
            sort: 'name',
            // filter: 'name != "Inbox"',
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

    async getInbox() {
        const { data: inbox, error } = await tryCatch(pb.collection(viewNotebooksCollection).getFirstListItem(`name="Inbox"`))

        if (error) {
            console.error('Error while getting inbox: ', error.message)
        }

        if (!inbox) {
            return
        }

        this.inbox = inbox
        this.inboxID = inbox.id
        this.inboxCount = inbox.note_count
        return inbox
    }

    async getAllCounts() {
        const { data, error } = await tryCatch(pb.collection(notesCollection).getList(1, 1))

        if (error) {
            console.error('Error while getting all notebooks: ', error.message)
        }

        this.totalNoteCount = data.totalItems
    }

    async createOnebyName(newName: string, parentNotebookID?: string) {
        const { data, error } = await tryCatch(
            pb.collection(notebooksCollection).create({
                'name': newName,
                'parent': parentNotebookID
            })
        )
        if (error) {
            console.error('Error while creating new notebook: ', error.data, error.message)
        }
    }

    async getOneByName(notebookName: string) {

        const { data, error } = await tryCatch(pb.collection(viewNotebooksCollection).getFirstListItem(`name="${notebookName}"`))

        if (error) {
            console.error('Error while get notebook: ', notebookName, error.data)
        }
        return data
    }

    async delete(recordID: string) {
        const { data: recordsToMove, error: errorsToMove } = await tryCatch(pb.collection(viewNotesCollection).getFullList({
            filter: `notebook = '${recordID}'`
        }))

        if (errorsToMove) {
            console.error('Error getting records to move: ', errorsToMove)
            return
        }

        if (!this.inbox) {
            await this.getInbox()
        }

        for (const record of recordsToMove) {
            const { data: recordToMove, error: errorToMove } = await tryCatch(pb.collection(notesCollection).update(record.id, {
                'notebook': this.inboxID
            }))

            if (errorToMove) {
                console.error('Error moving record: ', errorToMove.message)
                continue
            }
        }

        const { data, error } = await tryCatch(pb.collection(notebooksCollection).delete(recordID))

        if (error) {
            console.error('Error while deleting notebook: ', error)
        }
    }

    async updateOnebyName(recordID: string, newName: string) {
        const { data, error } = await tryCatch(
            pb.collection(notebooksCollection).update(recordID, {
                'name': newName
            })
        )
        if (error) {
            console.error('Error while updating notebook name: ', error)
        }
        // await this.getAll()
    }

    async updateOnebyParent(recordID: string, parentNotebook: string) {
        const { data, error } = await tryCatch(pb.collection(notebooksCollection).update(recordID, {
            'parent': parentNotebook
        }))
        if (error) {
            console.error('Error while updating parent notebook: ', error)
        }
        // await this.getAll()
    }
}

// export class defaultNotebooksState {
//     inbox = $state<Note>()
//     inboxID = $state<string>('')
//     inboxCount = $state<number>(0)
//     totalNoteCount = $state<number>(0)

//     constructor() {
//         $effect(() => {
//             pb.collection(notebooksCollection).subscribe('*', async () => {
//                 this.getAll()
//                 this.getAllCounts()
//             });
//             pb.collection(notesCollection).subscribe('*', async () => {
//                 this.getAll()
//                 this.getAllCounts()
//             });
//         })
//     }

//     async getAll() {

//         const { data: inbox, error } = await tryCatch(pb.collection(viewNotebooksCollection).getFirstListItem(`name="Inbox"`))

//         if (error) {
//             console.error('Error while getting inbox: ', error.message)
//         }

//         if (!inbox) {
//             return
//         }

//         this.inbox = inbox
//         this.inboxCount = inbox.note_count
//         this.inboxID = inbox.id
//     }

//     async getAllCounts() {
//         const { data, error } = await tryCatch(pb.collection(notesCollection).getList(1, 1))

//         if (error) {
//             console.error('Error while getting all notebooks: ', error.message)
//         }

//         this.totalNoteCount = data.totalItems
//     }
// }

export class NotelistState {
    notes = $state<NoteRecord>({
        items: [],
        page: 1,
        perPage: 25,
        totalItems: 0,
        totalPages: 0,
    })
    clickedPage = 1
    notebookID = $state<string>()
    notebookName = $state<string>()
    tagID = $state<string>()
    noteType = $state<NoteType['type']>()
    tags = $state<Tag[]>()

    constructor(noteType: NoteType) {
        this.noteType = noteType.type
        if (this.noteType == 'notebooks') {
            this.notebookID = noteType.id
        } else if (this.noteType == 'tags') {
            this.tagID = noteType.id
        }
    }

    async getDefault(newPage: number) {
        if (this.noteType === 'default') {
            this.getByPage(newPage)
        } else if (this.noteType === 'notebooks') {
            this.getByNotebook(this.notebookID, newPage)
        } else if (this.noteType === 'tags') {
            this.getByTag(this.tagID, newPage)
        } else if (this.noteType === 'archive') {
            this.getArchived(newPage)
        } else if (this.noteType === 'trash') {
            this.getDeleted(newPage)
        }
    }

    async getCurrentNotebook(notebookID: string) {
        const { data, error } = await tryCatch(pb.collection(viewNotebooksCollection).getOne(notebookID))

        if (error) {
            console.error('Error getting notebook: ', error)
        }
        return data
    }


    async getByPage(newPage = 1) {
        const start = performance.now()

        const { data, error } = await tryCatch(pb.collection(viewNotesCollection).getList(newPage, 24, {
            sort: '-created',
            filter: `status="active"`,
            expand: 'notebook, tags',
        }))

        if (error) {
            console.error('Unable to get notes by page ', error.message)
        }

        const end = performance.now()
        console.log(`Default notes seen in ${end - start} ms`)

        this.notes = data
        return this.notes
    }

    async getByNotebook(notebookID: string, page: number) {
        const { data, error } = await tryCatch(pb.collection(viewNotesCollection).getList(page, 24, {
            filter: `notebook="${notebookID}" && status="active"`,
            expand: 'tags,notebook',
            sort: '-created',
        }))

        if (error) {
            console.error('Error getting notes: ', error)
        }
        this.notes = data
        return this.notes
    }

    async getArchived(page: number) {
        const { data, error } = await tryCatch(pb.collection(viewNotesCollection).getList(page, 24, {
            filter: `status="archived"`,
            expand: 'tags,notebook',
            sort: '-created',
        }))

        if (error) {
            console.error('Error getting notes: ', error)
        }
        this.notes = data
        return this.notes
    }

    async getDeleted(page: number) {
        const { data, error } = await tryCatch(pb.collection(viewNotesCollection).getList(page, 24, {
            filter: `status="deleted"`,
            expand: 'tags,notebook',
            sort: '-created',
        }))

        if (error) {
            console.error('Error getting notes: ', error)
        }
        this.notes = data
        return this.notes
    }

    async getByTag(tagID: string, page: number) {
        const { data, error } = await tryCatch(pb.collection(viewNotesCollection).getList(page, 24, {
            filter: `tags~"${tagID}" && status="active"`,
            expand: 'tags,notebook',
            sort: '-created',
        }))

        if (error) {
            console.error('Error getting notes: ', error)
        }
        this.notes = data
        return this.notes
    }

    async getByFilter(customFilters: string, page) {
        const start = performance.now()
        // console.log(customFilters)
        const { data, error } = await tryCatch(pb.collection(notesCollection).getList(page, 24, {
            sort: '-created',
            expand: 'tags,notebook',
            filter: customFilters
        }))

        if (error) {
            console.error('Unable to get notes by filter ', error.data)
        }
        const end = performance.now()
        console.log(`search complete in ${end - start} ms`)

        this.notes = data
        return this.notes
    }

    async getOneByName() {
        return await pb.collection(notesCollection).getFirstListItem(`name='${name}'`)
    }

    async emptyTrash() {
        const { data, error } = await tryCatch(pb.collection(viewNotesCollection).getFullList({
            filter: `status="deleted"`,
        }))

        if (error) {
            console.error('Unable to get deleted notes: ', error)
        }

        if (!data) return

        await Promise.all(data.map(note => {
            pb.collection(notesCollection).delete(note.id)
        }))
    }

    async softDeleteMultiple(recordIDs: string[]) {
        await Promise.all(recordIDs.map(async recordID => {
            const { data, error } = await pb.collection(notesCollection).update(recordID, {
                status: 'deleted'
            })

            if (error) {
                console.error('Unable to delete note: ', error)
            }
        }))
        // await this.getDefault(this.clickedPage)
    }

    async unSoftDeleteMultiple(recordIDs: string[]) {
        await Promise.all(recordIDs.map(async recordID => {
            const { data, error } = await pb.collection(notesCollection).update(recordID, {
                status: 'active'
            })

            if (error) {
                console.error('Unable to restore deleted note: ', error)
            }
        }))
        // await this.getDefault(this.clickedPage)
    }

    async archiveMultiple(recordIDs: string[]) {
        await Promise.all(recordIDs.map(async recordID => {
            const { data, error } = await pb.collection(notesCollection).update(recordID, {
                status: 'archived'
            })

            if (error) {
                console.error('Unable to archive note: ', error)
            }
        }))
        // await this.getDefault(this.clickedPage)
    }

    async unArchiveMultiple(recordIDs: string[]) {
        await Promise.all(recordIDs.map(async recordID => {
            const { data, error } = await pb.collection(notesCollection).update(recordID, {
                status: 'active'
            })

            if (error) {
                console.error('Unable to un-archive note: ', error)
            }
        }))
        // await this.getDefault(this.clickedPage)
    }

    async changeNotebook(selectedNotesID: string[], newNotebookID: string) {
        await Promise.all(selectedNotesID.map(async noteID => {
            const { data, error } = await tryCatch(pb.collection(notesCollection).update(noteID, {
                notebook: newNotebookID
            }))
            if (error) {
                console.error('Error changing notebook: ', noteID, error)
            }
        }))
        // await this.getDefault(this.clickedPage)
    }

    // async changeTags(selectedNotesID: string[], selectedTags: string[]) {
    //   await Promise.all(selectedNotesID.map(async noteID => {
    //     const { data, error } = await tryCatch(pb.collection(notesCollection).update(noteID, {
    //       tags: selectedTags
    //     }))
    //     if (error) {
    //       console.error('Error changing tags: ', noteID, error)
    //     }
    //   }))
    //   await this.getDefault(this.clickedPage)
    // }

    // async getTags(selectedNotesID: string[]) {
    //   let tagList: Tag[] = []
    //   await Promise.all(selectedNotesID.map(async noteID => {
    //     const { data, error } = await tryCatch<Note, PError>(pb.collection(viewNotesCollection).getOne(noteID, {
    //       expand: 'tags'
    //     }))
    //     if (error) {
    //       console.error('Error getting tag: ', noteID, error)
    //       return
    //     }
    //     const tags = data.expand?.tags ?? []
    //     if (tags.length === 0) return
    //     tagList.push(...tags)
    //   }))
    //   const uniqueTags = Object.values(
    //     Object.fromEntries(tagList.map(tag => [tag.id, tag]))
    //   )
    //   this.tags = uniqueTags
    // }

    async addAllTags(selectedNotesID: string[], selectedTagsID: string[]) {
        await Promise.all(selectedNotesID.map(async noteID => {
            const { data, error } = await tryCatch(pb.collection(notesCollection).update(noteID, {
                'tags+': selectedTagsID
            }))
            if (error) {
                console.error('Error adding tag: ', noteID, error)
            }
        }))
        // await this.getDefault(this.clickedPage)
    }

    async clearTags(selectedNotesID: string[]) {
        await Promise.all(selectedNotesID.map(async noteID => {
            const { data, error } = await tryCatch(pb.collection(notesCollection).update(noteID, {
                'tags': []
            }))
            if (error) {
                console.error('Error clearing tags: ', noteID, error)
            }
        }))
        // await this.getDefault(this.clickedPage)
    }

}

export class NoteState {
    note = $state<Note>()
    noteList = $state()
    noteID: string

    constructor(noteID: string) {
        this.noteID = noteID
    }

    async getNote() {
        const { data, error } = await tryCatch(pb.collection(notesCollection).getOne(this.noteID, {
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
        const start = performance.now()
        const { data, error } = await tryCatch(pb.collection(viewNotesCollection).getList(page, 100, {
            expand: 'notebook,tags',
            sort: '-score',
            filter: `status="active"`,
        }))

        if (error) {
            console.error('Error getting discover note: ', error.data)
        }
        const end = performance.now()
        console.log(`Returned Discover List in ${end - start} ms`)

        this.noteList = data
        return data
    }

    async getDiscoverNote(index = 0) {
        this.noteID = this.noteList.items[index].id

        const { data: record, error: recordError } = await tryCatch(pb.collection(notesCollection).getFirstListItem(`id="${this.noteID}"`, {
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
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.noteID, {
            last_opened: new Date(),
        }))

        if (error) {
            console.error('Error updating note last opened date: ', error.message)
        }
    }

    async deleteNote() {
        const { data, error } = await tryCatch(pb.collection(notesCollection).delete(this.note.id))
        if (error) {
            console.error('Error deleting note: ', this.note.id, error)
        }
    }

    async softDeleteNote() {
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.note.id, {
            status: 'deleted'
        }))

        if (error) {
            console.error('Unable to delete note: ', error)
        }
    }

    async changeNotebook(newNotebookID: string) {
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.noteID, {
            notebook: newNotebookID
        }))
        if (error) {
            console.error('Error changing notebook: ', this.noteID, error)
        }
        await this.getNote()
        return data
    }

    async changeTags(selectedTags: string[]) {
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.noteID, {
            tags: selectedTags
        }))
        if (error) {
            console.error('Error changing tags: ', this.noteID, error)
        }
        await this.getNote()
        // return data
    }

    async addTag(selectedTagID: string) {
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.noteID, {
            'tags+': selectedTagID
        }))
        if (error) {
            console.error('Error adding tag: ', this.noteID, error)
        }
        await this.getNote()
    }

    async removeTag(selectedTagID: string) {
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.noteID, {
            'tags-': selectedTagID
        }))
        if (error) {
            console.error('Error removing tag: ', this.noteID, error)
        }
        await this.getNote()
    }

    async changeRating(newRating: number) {
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.noteID, {
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

        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.noteID, {
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

        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.noteID, {
            weight: newWeight
        }))
        if (error) {
            console.error('Error changing weight: ', this.noteID, error.message)
        }
        await this.getNote()
        return data
    }

    async archiveNote() {
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.note.id, {
            status: 'archived'
        }))

        if (error) {
            console.error('Unable to archive note: ', error)
        }
    }

    async unArchiveNote() {
        const { data, error } = await tryCatch(pb.collection(notesCollection).update(this.note.id, {
            status: 'active'
        }))

        if (error) {
            console.error('Unable to archive note: ', error)
        }
    }
}

export class settingState {
    ratingWeight = $state<number>()
    recencyWeight = $state<number>()
    weightWeight = $state<number>()
    randomWeight = $state<number>()
    fullPenaltyWindow = $state<number>()
    decayWindow = $state<number>()
    daysOld = $state<number>()

    async makeDefaultValue(name: string, defaultValue: number) {
        const { data, error } = await tryCatch<Setting, PError>(pb.collection(settingCollection).create({
            name: name,
            value: defaultValue
        }))

        if (error) {
            console.error('Error making setting: ', name, error.message)
            return 0
        }

        if (!data) return 0

        return data.value
    }

    async changeSetting(name: string, newValue: number) {
        const { data: settingRecord, error } = await tryCatch<Setting, PError>(pb.collection(settingCollection).getFirstListItem(`name="${name}"`))

        if (error || !settingRecord) {
            console.error('Error getting setting: ', name, error.message)
            return
        }

        const { data: settingUpdate, error: errorUpdate } = await tryCatch<Setting, PError>(pb.collection(settingCollection).update(settingRecord.id, {
            value: newValue
        }))

        if (errorUpdate || !settingUpdate) {
            console.error('Error making setting: ', name, errorUpdate.message)
            return 0
        }

        return settingUpdate.value
    }

    async getSetting(name: string, defaultValue: number) {
        const { data, error } = await tryCatch<Setting, PError>(pb.collection(settingCollection).getFirstListItem(`name="${name}"`))

        if (error || !data) {
            console.error('Error getting setting: ', name, error.message)
            const newSettingValue = await this.makeDefaultValue(name, defaultValue)
            return newSettingValue
        }

        return data.value
    }

    async getDefaultSettings() {
        this.ratingWeight = await this.getSetting('ratingWeight', 0.3)
        this.recencyWeight = await this.getSetting('recencyWeight', 0.3)
        this.weightWeight = await this.getSetting('weightWeight', 0.3)
        this.randomWeight = await this.getSetting('randomWeight', 0.3)
        this.fullPenaltyWindow = await this.getSetting('fullPenaltyWindow', 1)
        this.decayWindow = await this.getSetting('decayWindow', 12)
        this.daysOld = await this.getSetting('daysOld', 0)
    }
}

export default pb

const TAG_KEY = Symbol('TAG')
const NOTEBOOK_KEY = Symbol('NOTEBOOK')
const INBOX_KEY = Symbol('INBOX')
const SETTING_KEY = Symbol('SETTING')

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

// export function setDefaultNotebooksState() {
//     return setContext(INBOX_KEY, new defaultNotebooksState())
// }

// export function getDefaultNotebooksState() {
//     return getContext<ReturnType<typeof setDefaultNotebooksState>>(INBOX_KEY)
// }

export function setSettingState() {
    return setContext(SETTING_KEY, new settingState())
}

export function getSettingState() {
    return getContext<ReturnType<typeof setSettingState>>(SETTING_KEY)
}




