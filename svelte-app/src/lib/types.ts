
export interface Props {
  data: {
    note?: Note
    notes?: Note[]
    notebook?: Notebook
    notebooks?: Notebook[]
    tag?: Tag
    tags?: Tag[]
  }
}

export type Note = {
  id: string,
  title: string
  content: string
  notebook: string
  attachments: string[]
  expand?: {
    notebook?: Notebook,
    tags?: Tag
  }
  desciption: string
}

export type NoteRecord = {
  items: Note[]
  page: number,
  perPage: number,
  totalItems: number,
  totalPages: number
}

export type Notebook = {
  id: string
  name: string
  children?: Notebook
  parent?: string
  note_count: number
}

export type Tag = {
  id: string
  name: string
  children?: Tag,
  expand: {
    notes_via_tags: Note[]
  },
  parent?: string
  note_count: number
}

export type NoteList = {
  items: Note[]
}

export type EnResource = {
  data: {
    "#text": string
  },
  hash?: string,
  file?: File,
  fileURL?: string,
  height: number,
  width: number,
  mime: string,
  "resource-attributes": {
    "file-name": string,
    "source-url": string
  }
}

export type EnMedia = {
  hash: string,
  style: string,
  type: string
}

export type EnMedias = {
  "en-note": {
    "en-media": EnMedia | EnMedia[]
  }
}

export type EnNote = {
  "en-export": {
    note: {
      title: string,
      content: string,
      created: string,
      updated: string,
      "note-attributes": {
        source: string,
        "source-url": string
      },
      tag: string | string[],
      resource: EnResource | EnResource[]
    }
  }
}

