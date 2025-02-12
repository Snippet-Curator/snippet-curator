import { XMLParser } from 'fast-xml-parser'
import SparkMD5 from 'spark-md5';
import type { EnNote, EnMedia, EnResource } from './types';


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

  constructor(fileContent: string) {

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

  base64ToMD(base64String: string) {
    const binaryStr = atob(base64String);
    return SparkMD5.hashBinary(binaryStr);
  }

  parseEnex(fileContent: string) {
    const xmlNote: EnNote = parser.parse(fileContent)
    const xmlMedia: EnMedia = parser.parse(xmlNote['en-export']['note']['content'])['en-note']['en-media']

    return {
      xmlNote,
      xmlMedia
    }
  }

  replaceEnMedia() {
    // find en medias
    // match with resources
    // replace en medias with Media
  }

}
