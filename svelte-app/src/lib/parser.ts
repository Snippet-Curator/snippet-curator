import { XMLParser } from 'fast-xml-parser'
import SparkMD5 from 'spark-md5';
import sanitizeHTML from 'sanitize-html';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'

import type { EnNote, EnMedia, EnResource } from './types';
import pb from '$lib/db.svelte'
import { tryCatch } from './utils.svelte';

dayjs.extend(customParseFormat)

const notesCollection = 'notes'
const notebookCollection = 'notebooks'
const inboxNotebook = 'Inbox'
const archiveNotebook = 'Archive'
const trashNotebook = 'Trash'
const baseURL = 'http://127.0.0.1:8090/api/files'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
})

export async function makeDefaultNotebook() {
  const { data, error } = await tryCatch(
    pb.collection(notebookCollection).create({
      name: inboxNotebook
    })
  )

  if (error) {
    console.error('Inbox notebook already exists: ', error)
  }

  const { data: archiveData, error: archiveError } = await tryCatch(pb.collection(notebookCollection).create({
    name: archiveNotebook
  }))

  if (archiveError) {
    console.error('Archive notebook already exists: ', error)
  }

  const { data: trashData, error: trashError } = await tryCatch(pb.collection(notebookCollection).create({
    name: trashNotebook
  }))

  if (trashError) {
    console.error('Trash notebook already exists: ', error)
  }
  return data
}

async function getDefaultNotebook() {
  const { data, error } = await tryCatch(pb.collection(notebookCollection).getFirstListItem(`name="${inboxNotebook}"`))

  if (error) {
    console.error('Inbox notebook not found: ', error)
  }
  return data
}

async function getVideoThumb(videoUrl: string): Promise<File> {

  return new Promise((resolve, reject) => {

    if (!videoUrl || videoUrl.trim() == '') {
      return reject(new Error('Video URL is empty'))
    }

    const video = document.createElement("video");

    // setting up properties
    video.src = videoUrl;
    video.crossOrigin = "anonymous"; // Prevent CORS issues
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata'

    // add error handling
    video.onerror = (e) => {
      reject(new Error(`Video loading error: ${video.error?.message} || 'Unknown error'`))
    }

    // make sure metadata loaded before seeking
    video.onloadedmetadata = () => {
      // now seek
      video.onloadeddata = () => {
        video.currentTime = 1; // Capture at 1 second
      };
    }

    video.onseeked = async () => {
      // small delay
      await new Promise((res) => setTimeout(res, 200));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // draw the current video frame to the canvas
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to Blob and create a File
      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailFile = new File([blob], "thumbnail.png", { type: "image/png" });
          resolve(thumbnailFile)
        } else {
          reject(new Error('Failed to create thumbnail blob'))
        }
      }, "image/png");
    };
  })
}

function addMediaToContent(mimeType: string, fileURL: string, fileName: string) {
  if (mimeType.includes('image')) {
    return `<img  src=${fileURL} type=${mimeType}>`;
  }

  if (mimeType == 'video/mp4') {
    return `<video style='width:100%' controls><source src=${fileURL} type=${mimeType} />Your browser does not support the video tag.</video>`
  }

  if (mimeType == 'audio/mpeg') {
    return `<div style="text-align: center;"><audio class="audio-player" controls style="width: 80vw; max-width: 400px;"><source src=${fileURL} type=${mimeType}><a href=${fileURL} target="_blank">${fileName}</a>.</audio></div>`
  }

  if (mimeType == 'application/pdf') {
    return `<iframe src=${fileURL} style="width: 80vw; height: 100vh; max-width: 900px; margin: auto; display: block;" frameborder="0" > </iframe> <a href=${fileURL} target="_blank">${fileName}</a>`
  }

  else {
    return `<a href=${fileURL} type=${mimeType}/>${fileName}</a>`
  }
}

function createDescription(htmlContent: string, maxLength = 300) {
  const strippedText = htmlContent
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/\s+/g, ' '); // Normalize whitespace

  const trimmedText = strippedText.trim();

  if (trimmedText.length <= maxLength) {
    return trimmedText;
  }

  return trimmedText.substring(0, maxLength);
}

export function sanitizeContent(content: string) {
  const cleanContent = sanitizeHTML(content, {
    parseStyleAttributes: false,
    allowedTags: sanitizeHTML.defaults.allowedTags.concat([
      'img',
      'form',
      'svg',
      'code',
      'style',
      'video',
      'source',
      'iframe'
    ]),
    // allowedTags: false,
    allowVulnerableTags: true,
    allowedAttributes: {
      '*': ['style', 'id', 'class', 'src', 'href', 'type', 'controls']
    },
    allowedSchemes: ['data', 'http', 'https'],
    transformTags: {
      a: function (tagName, attribs) {
        if (
          !attribs.href ||
          !attribs.href == undefined ||
          attribs['href'] == '#' ||
          attribs['href'].includes('javascript:')
        ) {
          return {
            tagName: 'span',
            attribs: attribs
          };
        }
        return {
          tagName: 'a',
          attribs: attribs
        };
      },
      // div: function (tagName, attribs) {
      //   let newStyle =
      //     'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;';
      //   attribs.style = attribs.style ? `${attribs.style};${newStyle}` : newStyle;
      //   return {
      //     tagName: 'div',
      //     attribs: attribs
      //   };
      // },
      // pre: sanitizeHTML.simpleTransform('pre', {
      //   style:
      //     'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;'
      // }),
      // p: sanitizeHTML.simpleTransform('p', {
      //   style:
      //     'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;'
      // })
    }
  });
  return cleanContent
}

export class htmlImport {
  title: string
  content: string
  parsedHTML: Document
  source: string
  sourceUrl: string
  recordID: string
  added: string
  description: string

  constructor(fileContent: string) {
    this.recordID = ''

    const { parsedHTML, title } = this.parseHTML(fileContent)
    this.title = title
    this.parsedHTML = parsedHTML
    this.content = this.parseHTMLContent(this.parsedHTML)
    this.source = 'SingleFile clip'
    this.sourceUrl = this.parseURL(this.parsedHTML)
    this.added = new Date().toISOString()
    this.description = ''
  }

  parseHTML(fileContent: string) {
    const parser = new DOMParser()
    const parsedHTML = parser.parseFromString(fileContent, 'text/html')
    const title = parsedHTML.querySelector('title')?.textContent || 'Untitled'

    return {
      parsedHTML, title
    }
  }

  parseHTMLContent(parsedHTML: Document) {
    const bodyContent = parsedHTML.body.innerHTML
    const styleTags = [...parsedHTML.querySelectorAll('style')].map(style => style.outerHTML).join('\n')
    const htmlContent = `${styleTags} ${bodyContent}`

    return htmlContent
  }

  parseURL(parsedHTML: Document) {
    return parsedHTML.querySelector('meta[property="og:url"]')?.getAttribute('content') || ""
  }

  base64ToFile(base64: string, mimeType: string) {
    const extension = mimeType.split("/")[1];
    const filename = `${crypto.randomUUID()}.${extension}`;

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    return new File([byteArray], filename, { type: mimeType });
  }

  async uploadImg() {
    for (const [index, img] of this.parsedHTML.querySelectorAll('img').entries()) {
      if (!img.src.includes('data:image')) return

      const base64Data = img.src.split(',')[1]
      const mimeType = img.src.split(';')[0].split(':')[1]
      const extension = mimeType.split('/')[1]

      // convert to file
      const imgFile = this.base64ToFile(base64Data, mimeType)

      // upload to database
      const record = await pb.collection('notes').update(this.recordID, {
        'attachments+': [imgFile]
      })

      // fill in thumbnail
      if (record.thumbnail == '') {
        let thumbnailURL = ''

        // make thumbnail based on type of resource file
        if (mimeType == 'image/gif') {
          thumbnailURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments[0]}`
        } else {
          thumbnailURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments[0]}?thumb=500x0`
        }

        // update thumbnail
        await pb.collection('notes').update(this.recordID, {
          'thumbnail': thumbnailURL
        })
      }

      // get new filename and url
      const newName = record.attachments[index]
      const newURL = `${baseURL}/${notesCollection}/${this.recordID}/${newName}`

      // replace img src
      img.setAttribute('src', newURL)
    }
    this.content = this.parseHTMLContent(this.parsedHTML)
  }


  async uploadToDB() {
    const defaultNotebook = await getDefaultNotebook()

    const skeletonData = {
      'title': this.title,
      'source': this.source,
      'added': this.added,
      'source_url': this.sourceUrl,
      'notebook': defaultNotebook.id
    }

    let record

    try {
      record = await pb.collection('notes').create(skeletonData)
    } catch (e) {
      console.log(e, 'Possible duplicate note')
    }

    this.recordID = record.id

    await this.uploadImg()
    this.content = sanitizeContent(this.content)
    this.description = createDescription(this.content)

    const data = {
      'content': this.content,
      'original_content': this.content,
      'description': this.description
    }

    await pb.collection('notes').update(this.recordID, data)
  }
}

export class EnImport {
  enNote: EnNote
  enMedias: EnMedia[]
  xmlResource: EnResource | EnResource[]
  enResources: EnResource[]

  title: string
  content: string
  added: string
  updated: string
  source: string
  sourceUrl: string
  tags: string[]
  recordID: string
  description: string

  constructor(fileContent: string) {

    this.recordID = ''

    const { xmlNote, xmlMedia, xmlContent } = this.parseEnex(fileContent)

    this.enNote = xmlNote
    this.content = xmlContent
    this.enMedias = Array.isArray(xmlMedia) ? xmlMedia : [xmlMedia]

    const tags = this.enNote['en-export'].note.tag || ''
    this.xmlResource = xmlNote["en-export"]['note']['resource']
    this.enResources = Array.isArray(this.xmlResource) ? this.xmlResource : [this.xmlResource]
    this.title = this.enNote['en-export'].note.title
    this.added = dayjs(this.enNote['en-export'].note.created, 'YYYYMMDDTHHmmss[Z]').toISOString()
    this.updated = this.enNote['en-export'].note.updated
    this.source = this.enNote['en-export'].note['note-attributes'].source
    this.sourceUrl = this.enNote['en-export'].note['note-attributes']['source-url']
    this.tags = Array.isArray(tags) ? tags : [tags]
    this.description = ''
  }

  parseEnex(fileContent: string) {
    const xmlNote: EnNote = parser.parse(fileContent)
    const xmlMedia: EnMedia = parser.parse(xmlNote['en-export']['note']['content'])['en-note']['en-media']
    const xmlContent = xmlNote['en-export']['note']['content'].match(/<en-note[\s\S]*<\/en-note>/)?.[0] as string

    return {
      xmlNote,
      xmlMedia,
      xmlContent
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
      const record = await pb.collection(notesCollection).update(this.recordID, {
        'attachments+': [resource.file]
      })

      // if not images or not videos, skip thumbnail creation
      if (!resource.mime.includes('image') && !resource.mime.includes('video')) {
        return
      }

      // fill in thumbnail
      if (record.thumbnail == '') {
        let thumbnailURL = ''

        // make thumbnail based on type of resource file
        if (resource.mime == 'image/gif') {
          thumbnailURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments[0]}`
        } else if (resource.mime == 'video/mp4') {
          const videoURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments[0]}`
          const thumbnailFile = await getVideoThumb(videoURL)
          const thumbedRecord = await pb.collection('notes').update(this.recordID, {
            'attachments+': [thumbnailFile]
          })
          thumbnailURL = `${baseURL}/${notesCollection}/${this.recordID}/${thumbedRecord.attachments[1]}?thumb=500x0`
        }
        else {
          thumbnailURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments[0]}?thumb=500x0`
        }

        // update thumbnail
        await pb.collection('notes').update(this.recordID, {
          'thumbnail': thumbnailURL
        })
      }

      // get new filename and url
      const newName = record.attachments[index]
      const newURL = `${baseURL}/${notesCollection}/${this.recordID}/${newName}`
      resource.fileURL = newURL
    }

  }

  replaceEnMedia() {
    // replaces en-media with regular html tags within content

    const mediaMatch = /<en-media[^>]+?hash="([a-zA-Z0-9]+)"[^>]*\/?>/g

    if (this.enResources.length == 0) return

    const replaceMedia = (match: string, hash: string) => {
      const resource = this.enResources.filter((resource) => {
        return resource.hash == hash
      })

      if (resource.length == 0) return

      return addMediaToContent(resource[0].mime, resource[0].fileURL, resource[0]["resource-attributes"]['file-name'])
    }

    this.content = this.content.replace(mediaMatch, replaceMedia);
  }

  async addTags() {
    if (this.tags.length == 1 && this.tags[0] == '') return ''
    const tagList: string[] = []
    const existingTags = await pb.collection('tags').getFullList() as { id: string; name: string }[]
    const existingTagNames = new Set(existingTags.map((tag: { name: string }) => tag.name))

    for (const tag of this.tags) {
      if (existingTagNames.has(tag)) {
        const record = existingTags.find((record: { name: string }) => record.name === tag)
        tagList.push(record.id)
      } else {
        const newTagRecord = await pb.collection('tags').create({ 'name': tag.toLowerCase() })
        tagList.push(newTagRecord.id)
      }
    }
    return tagList
  }

  async uploadToDB() {
    const defaultNotebook = await getDefaultNotebook()
    let tags
    try {
      tags = await this.addTags()
    } catch (e) {
      console.log(this.title, 'Error adding tags')
    }


    const skeletonData = {
      'title': this.title,
      'added': this.added,
      'source': this.source,
      'source_url': this.sourceUrl,
      'tags': tags,
      'notebook': defaultNotebook.id
    }

    let record
    try {
      record = await pb.collection('notes').create(skeletonData)
    } catch (e) {
      console.log(e, 'Possible duplicate note')
    }
    this.recordID = record.id

    await this.uploadResources()
    this.replaceEnMedia()
    this.content = sanitizeContent(this.content)
    this.description = createDescription(this.content)

    const data = {
      'content': this.content,
      'original_content': this.content,
      'description': this.description
    }

    await pb.collection('notes').update(this.recordID, data)
  }
}

export class fileImport {
  title: string
  file: File
  mimeType: string
  content: string
  fileURL: string
  recordID: string

  constructor(file: File) {
    this.file = file
    this.mimeType = file.type
    this.recordID = ''
    this.fileURL = ''
    this.title = `${file.name} ${dayjs(Date()).format('MM-DD-YYYY')}`
  }

  async uploadResources() {
    const record = await pb.collection(notesCollection).update(this.recordID, {
      'attachments+': [this.file]
    })

    // update attachment URL
    this.fileURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments[0]}`

    // if not images or not videos, skip thumbnail creation
    if (!this.mimeType.includes('image') && !this.mimeType.includes('video')) {
      return
    }

    // fill in thumbnail
    else if (record.thumbnail == '') {
      let thumbnailURL = ''

      // make thumbnail based on type of resource file
      if (this.mimeType == 'image/gif') {
        thumbnailURL = `${this.fileURL}`
      } else if (this.mimeType == 'video/mp4') {
        const thumbnailFile = await getVideoThumb(this.fileURL)
        const thumbedRecord = await pb.collection(notesCollection).update(this.recordID, {
          'attachments+': [thumbnailFile]
        })
        thumbnailURL = `${baseURL}/${notesCollection}/${this.recordID}/${thumbedRecord.attachments[1]}?thumb=500x0`
      }
      else {
        thumbnailURL = `${this.fileURL}?thumb=500x0`
      }

      // update thumbnail
      await pb.collection(notesCollection).update(this.recordID, {
        'thumbnail': thumbnailURL
      })
    }
  }



  async uploadToDB() {
    const defaultNotebook = await getDefaultNotebook()
    const skeletonData = {
      'title': this.title,
      'notebook': defaultNotebook.id
    }

    let record
    try {
      record = await pb.collection(notesCollection).create(skeletonData)
    } catch (e) {
      console.log(e, 'Possible duplicate note')
    }
    this.recordID = record.id

    await this.uploadResources()
    this.content = addMediaToContent(this.mimeType, this.fileURL, this.file.name)

    const data = {
      'content': this.content,
      'original_content': this.content,
    }

    await pb.collection(notesCollection).update(this.recordID, data)
  }
}
