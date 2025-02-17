import { XMLParser } from 'fast-xml-parser'
import SparkMD5 from 'spark-md5';
import type { EnNote, EnMedia, EnResource } from './types';
import pb from '$lib/db'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
})

export function base64ToMD(base64String: string) {
  const binaryStr = atob(base64String);
  return SparkMD5.hashBinary(binaryStr);
}

export function parseEnex(fileContent: string) {
  const xmlNote = parser.parse(fileContent)
  const xmlMedia = parser.parse(xmlNote['en-export']['note']['content'])
  return {
    xmlNote,
    xmlMedia
  }
}

export class EnImport {
  enNote: EnNote
  enMedias: EnMedia[]
  xmlResource: EnResource | EnResource[]
  enResources: EnResource[]

  title: string
  content: string
  created: string
  updated: string
  source: string
  sourceUrl: string
  tags: string[]
  recordID: string
  collectionID: string
  baseURL: string

  constructor(fileContent: string) {

    this.recordID = ''
    this.collectionID = 'notes'
    this.baseURL = 'http://127.0.0.1:8090/api/files'

    const { xmlNote, xmlMedia } = this.parseEnex(fileContent)
    this.enNote = xmlNote
    const tags = this.enNote['en-export'].note.tags
    this.enMedias = Array.isArray(xmlMedia) ? xmlMedia : [xmlMedia]
    this.xmlResource = xmlNote["en-export"]['note']['resource']
    this.enResources = Array.isArray(this.xmlResource) ? this.xmlResource : [this.xmlResource]
    this.title = this.enNote['en-export'].note.title
    this.content = this.enNote['en-export'].note.content
    this.created = this.enNote['en-export'].note.created
    this.updated = this.enNote['en-export'].note.updated
    this.source = this.enNote['en-export'].note['note-attributes'].source
    this.sourceUrl = this.enNote['en-export'].note['note-attributes']['source-url']
    this.tags = Array.isArray(tags) ? tags : [tags]

  }

  parseEnex(fileContent: string) {
    const xmlNote: EnNote = parser.parse(fileContent)
    const xmlMedia: EnMedia = parser.parse(xmlNote['en-export']['note']['content'])['en-note']['en-media']

    return {
      xmlNote,
      xmlMedia
    }
  }

  convertResourceToFile(resource: EnResource) {
    const binaryStr = atob(resource.data['#text']);
    const byteArray = new Uint8Array(binaryStr.length)

    for (let i = 0; i < binaryStr.length; i++) {
      byteArray[i] = binaryStr.charCodeAt(i);
    }
    // Create a Blob
    const blob = new Blob([byteArray], { type: resource.mime });

    return new File([blob], resource['resource-attributes']['file-name'] || 'unknown', {
      type: resource.mime,
    });
  }

  async uploadResources() {
    for (const [index, resource] of this.enResources.entries()) {
      if (!resource) return

      // converts to binary
      const binaryStr = atob(resource.data['#text']);

      // adds hash
      resource.hash = SparkMD5.hashBinary(binaryStr);

      // adds file and converts to file
      resource.file = this.convertResourceToFile(resource)

      // upload to database
      const record = await pb.collection('notes').update(this.recordID, {
        'attachments+': [resource.file]
      })

      // get new filename and url
      const newName = record.attachments[index]
      const newURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${newName}`
      resource.fileURL = newURL
    }

  }

  replaceEnMedia() {
    const mediaMatch = /<en-media[^>]+?hash="([a-zA-Z0-9]+)"[^>]*\/?>/g

    const replaceMedia = (match: string, hash: string) => {
      console.log('replaceEnMedia hash: ', hash)
      const resource = this.enResources.filter((resource) => {
        return resource.hash == hash
      })
      return `<img src=${resource[0].fileURL}>`
    }

    this.content = this.content.replace(mediaMatch, replaceMedia);
  }

  async uploadToDB() {
    const skeletonData = {
      'title': this.title,
    }

    const record = await pb.collection('notes').create(skeletonData)
    this.recordID = record.id
    console.log('after upload: ', this.recordID, this.collectionID)

    await this.uploadResources()
    this.replaceEnMedia()

    const data = {
      'content': this.content,
    }

    console.log('content: ', this.content)

    const record2 = await pb.collection('notes').update(this.recordID, data)
    console.log('after update', record2)
  }
}
