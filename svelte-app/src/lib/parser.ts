import { XMLParser } from 'fast-xml-parser'
import SparkMD5 from 'spark-md5';
import sanitizeHTML from 'sanitize-html';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'

import type { EnNote, EnMedia, EnResource, Resource, PError } from './types';
import pb, { pbURL } from '$lib/db.svelte'
import { tryCatch } from './utils.svelte';
import type { RecordModel } from 'pocketbase';


dayjs.extend(customParseFormat)

const notesCollection = 'notes'
const notebookCollection = 'notebooks'
const inboxNotebook = 'Inbox'
const archiveNotebook = 'Archive'
const trashNotebook = 'Trash'
const baseURL = 'http://127.0.0.1:8090/api/files'
const remoteURL = pbURL + '/api/files'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
})


export async function makeDefaultNotebook() {
  const { data, error } = await tryCatch<RecordModel, PError>(pb.collection(notebookCollection).create({ name: inboxNotebook })
  )

  if (error) {
    if (error.data.data.name.code == "validation_not_unique") {
      console.log('Inbox already exists')
    } else {
      console.error('Error making Inbox: ', error.message)
    }
  }

  const { data: archiveData, error: archiveError } = await tryCatch<RecordModel, PError>(pb.collection(notebookCollection).create({
    name: archiveNotebook
  }))

  if (archiveError) {
    if (archiveError.data.data.name.code == "validation_not_unique") {
      console.log('Archive already exists')
    } else {
      console.error('Error making Archive: ', archiveError.message)
    }
  }

  const { data: trashData, error: trashError } = await tryCatch<RecordModel, PError>(pb.collection(notebookCollection).create({
    name: trashNotebook
  }))

  if (trashError) {
    if (trashError.data.data.name.code == "validation_not_unique") {
      console.log('Trash already exists')
    } else {
      console.error('Error making Trash: ', trashError.message)
    }
  }
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

async function createThumbnail(recordID: string, resources: File[]) {
  const { data, error } = await tryCatch(pb.collection(notesCollection).getFirstListItem(`id="${recordID}"`))

  if (error) {
    console.error('Error getting record: ', error.message)
  }

  if (!data || !data.attachments) {
    console.error('Error: no attachments found')
  }

  let thumbnailURL = ''
  let record = data

  for (const [index, resource] of resources.entries()) {
    if (!record) break
    if (record.thumbnail) break
    if (resource.size < 10000) continue

    const mimeType = resource.type

    if (!mimeType.includes('image') && !mimeType.includes('video') && !mimeType.includes('application/octet-stream')) {
      continue
    }

    if (mimeType.includes('video') || mimeType == 'application/octet-stream') {
      const videoURL = `${remoteURL}/${notesCollection}/${record.id}/${record.attachments[index]}`
      const thumbnailFile = await getVideoThumb(videoURL)
      const { data: thumbRecord, error: thumbError } = await tryCatch(pb.collection(notesCollection).update(record.id, {
        'attachments+': [thumbnailFile]
      }))
      if (thumbError) {
        console.error('Error getting updated thumbnail record: ', thumbError.message)
      }
      if (!thumbRecord) continue
      thumbnailURL = `${baseURL}/${notesCollection}/${record.id}/${thumbRecord.attachments.at(-1)}?thumb=500x0`
      // uses video itself as thumbnail:
      // thumbnailURL = `${baseURL}/${notesCollection}/${record.id}/${record.attachments[index]}`
    }

    else if (mimeType == 'image/gif') {
      thumbnailURL = `${baseURL}/${notesCollection}/${record.id}/${record.attachments[index]}`
    }

    else {
      thumbnailURL = `${baseURL}/${notesCollection}/${record.id}/${record.attachments[index]}?thumb=500x0`
    }

    // update thumbnail
    const { data: updatedRecord, error: thumbnailError } = await tryCatch(pb.collection(notesCollection).update(record.id, {
      'thumbnail': thumbnailURL
    }))

    if (thumbnailError) {
      console.error('Error updating record: ', thumbnailError.message)
    }
    record = updatedRecord
  }


}

async function getFileHash(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const hash = SparkMD5.ArrayBuffer.hash(arrayBuffer);
  return hash;
}

function getPocketbaseResource(file: File, hash: string, url: string) {
  const resource: Resource = {
    name: file.name,
    size: file.size,
    hash: hash,
    type: file.type,
    fileURL: url,
    lastUpdated: new Date().toISOString(),
  }
  return resource
}

function addMediaToContent(mimeType: string, fileURL: string, fileName: string) {
  if (mimeType.includes('image')) {
    return `<img src=${fileURL} type=${mimeType}>`;
  }

  if (mimeType.includes('video')) {
    return `<video style='width:100%' controls><source src=${fileURL} type=${mimeType} />Your browser does not support the video tag.</video>`
  }

  if (mimeType == 'application/octet-stream') {
    return `<video style='width:100%' controls><source src=${fileURL} />Your browser does not support the video tag.</video>`
  }

  if (mimeType == 'audio/mpeg') {
    return `<div style="text-align: center;"><audio class="audio-player" controls style="width: 80vw; max-width: 400px;"><source src=${fileURL} type=${mimeType}><a href=${fileURL} target="_blank">${fileName}</a>.</audio></div>`
  }

  if (mimeType == 'application/pdf') {
    return `<a href=${fileURL} target="_blank">${fileName}</a><iframe src=${fileURL} style="width: 80vw; min-height: 800px; height: 100vh; max-width: 900px; margin: auto; display: block;" frameborder="0" > </iframe> `
  }

  else {
    return `<a href=${fileURL} type=${mimeType}/>${fileName}</a>`
  }
}

function createDescription(htmlContent: string, maxLength = 300) {
  if (!htmlContent) return null

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

// export function sanitizeHTMLContent(content: string) {
//   const cleanContent = sanitizeHTML(content, {
//     parseStyleAttributes: false,
//     // allowedTags: sanitizeHTML.defaults.allowedTags.concat([
//     //   'img',
//     //   'form',
//     //   'code',
//     //   'style',
//     //   'video',
//     //   'source',
//     // ]),
//     allowedTags: false,
//     allowVulnerableTags: true,
//     // allowedAttributes: {
//     // '*': ['src', 'href', 'class', 'id'],
//     // 'a': ['href', 'type', 'target'],
//     // 'img': ['src', 'type'],
//     // 'video': ['style', 'controls'],
//     // 'audio': ['class', 'controls', 'style'],
//     // 'iframe': ['src', 'style'],
//     // 'source': ['src', 'type'],
//     // 'p': ['*'],
//     // 'div': ['*'],
//     // 'h1': ['*'],
//     // 'h2': ['*'],
//     // 'h3': ['*'],
//     // 'h4': ['*'],
//     // 'h5': ['*'],
//     // 'h6': ['*'],
//     //   '*': ['style', 'id', 'class', 'src', 'href', 'type', 'controls']
//     // },
//     allowedSchemes: ['data', 'http', 'https'],
//     transformTags: {
//       a: function (tagName, attribs) {
//         if (
//           !attribs.href ||
//           !attribs.href == undefined ||
//           attribs['href'] == '#' ||
//           attribs['href'].includes('javascript:')
//         ) {
//           return {
//             tagName: 'span',
//             attribs: attribs
//           };
//         }
//         return {
//           tagName: 'a',
//           attribs: attribs
//         };
//       },
//     },
//     // exclusiveFilter: function (frame) {
//     //   if (frame.tag == 'style') {
//     //     if (frame.text.includes('base64')) {
//     //       return true; // Exclude this <style> tag
//     //     }
//     //   }
//     //   if (frame.tag == 'link' && frame.attribs.href.includes('data:image/svg+xm')) {
//     //     return true;
//     //   }
//     //   return false;
//     // }
//   });
//   return cleanContent
// }

// export function sanitizeContent(content: string) {
//   const cleanContent = sanitizeHTML(content, {
//     parseStyleAttributes: false,
//     allowedTags: sanitizeHTML.defaults.allowedTags.concat([
//       'img',
//       'form',
//       'svg',
//       'code',
//       'style',
//       'video',
//       'source',
//       'iframe'
//     ]),
//     // allowedTags: false,
//     allowVulnerableTags: true,
//     allowedAttributes: {
//       '*': ['style', 'id', 'class', 'src', 'href', 'type', 'controls']
//     },
//     allowedSchemes: ['data', 'http', 'https'],
//     transformTags: {
//       a: function (tagName, attribs) {
//         if (
//           !attribs.href ||
//           !attribs.href == undefined ||
//           attribs['href'] == '#' ||
//           attribs['href'].includes('javascript:')
//         ) {
//           return {
//             tagName: 'span',
//             attribs: attribs
//           };
//         }
//         return {
//           tagName: 'a',
//           attribs: attribs
//         };
//       },
//     },

//     // div: function (tagName, attribs) {
//     //   let newStyle =
//     //     'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;';
//     //   attribs.style = attribs.style ? `${attribs.style};${newStyle}` : newStyle;
//     //   return {
//     //     tagName: 'div',
//     //     attribs: attribs
//     //   };
//     // },
//     // pre: sanitizeHTML.simpleTransform('pre', {
//     //   style:
//     //     'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;'
//     // }),
//     // p: sanitizeHTML.simpleTransform('p', {
//     //   style:
//     //     'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;'
//     // })

//   });
//   return cleanContent
// }

export class htmlImport {
  title: string | 'Untitled'
  content: string
  parsedHTML: Document
  source: string | null
  sourceURL: string | null
  recordID: string
  added: string
  description: string | null
  selectedNotebookdID: string
  HTMLparser: DOMParser
  resources: Resource[]

  constructor(fileContent: string, selectedNotebookID: string) {
    this.HTMLparser = new DOMParser()
    this.content = fileContent
    this.parsedHTML = this.parseHTML(fileContent)
    this.title = this.getTitle()
    this.description = this.getDescription()
    this.source = this.getSource()
    this.sourceURL = this.getSourceURL()
    this.added = this.getAdded()
    this.recordID = ''
    this.selectedNotebookdID = selectedNotebookID
    this.resources = []
    // const { parsedHTML, title, sourceURL, added } = this.parseHTML(fileContent)
    // this.parsedHTML = parsedHTML
  }

  parseHTML(fileContent: string) {
    return this.HTMLparser.parseFromString(fileContent, 'text/html')
  }

  getTitle() {
    return this.parsedHTML.querySelector('title')?.textContent || 'Untitled'
  }

  getDescription() {
    // parse instagram saves with source meta property
    const description = this.parsedHTML.querySelector('meta[property="description"]')

    if (description) {
      return description.getAttribute('content')
    }

    const ogDescription = this.parsedHTML.querySelector('meta[property="og:description"]')?.getAttribute('content')

    if (!ogDescription) return null

    return createDescription(ogDescription)
  }

  getSource() {
    // parse instagram saves with source meta property
    const source = this.parsedHTML.querySelector('meta[property="source"]')

    if (source) {
      return source.getAttribute('content')
    }

    // if not, use regex to match singleFile source
    const match = this.content.match(/url:\s*(.+?)\s+saved date:\s*(.+?)\s*-->/s);

    if (match) {
      return 'SingleFile Save'
    }

    return null
  }

  getSourceURL() {
    const sourceURL = this.parsedHTML.querySelector('meta[property="source-url"]')

    if (sourceURL) {
      return sourceURL.getAttribute('content')
    }

    const match = this.content.match(/url:\s*(.+?)\s+saved date:\s*(.+?)\s*-->/s);

    if (!match || !match[1]) {
      return null
    }

    return match[1];
  }

  getAdded() {
    const added = this.parsedHTML.querySelector('meta[property="added"]')

    if (added && added.textContent) {
      return added.getAttribute('content') || new Date().toISOString()
    }

    const match = this.content.match(/url:\s*(.+?)\s+saved date:\s*(.+?)\s*-->/s);

    if (match) {
      return new Date(match[2]).toISOString()
    }

    return new Date().toISOString()
  }

  base64ToFile(base64: string, mimeType: string) {
    let extension: string = ''
    let filename: string = ''
    let byteCharacters: string = ''
    let hash: string = ''

    try {
      extension = mimeType.split("/")[1];
      filename = `${crypto.randomUUID()}.${extension}`;
      byteCharacters = atob(base64);
      hash = SparkMD5.hashBinary(byteCharacters);
    } catch (err) {
      console.error('Error converting resource: ', err)
    }

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    return {
      file: new File([byteArray], filename, { type: mimeType }),
      hash: hash
    }
  }


  async replaceResources(fileContent: string) {
    // replaces src with image and font with pocketbase file links. Href is skipped
    const mediaMatch = /\bsrc=(['"])?(data:(?:image|font|video)\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)\1?/g

    if (!fileContent) {
      console.error('Error: no file content')
      return
    }

    const matches = [...fileContent.matchAll(mediaMatch)]
    let updatedContent = fileContent

    for (const match of matches) {
      const openingQuote = match[1] || undefined
      const dataURL = match[2] || undefined
      const closingQuote = match[3] || undefined

      if (!dataURL) {
        console.error('Error: no dataURL')
        continue
      }

      const mimeType = dataURL.split(';')[0].split(':')[1] || undefined
      const base64Data = dataURL.split(',')[1]

      if (!base64Data || !mimeType) {
        console.error('Error: invalid data URL format')
        continue
      }

      const { file: resourceFile, hash } = this.base64ToFile(base64Data, mimeType)

      if (!resourceFile) {
        console.error('Error converting resource file')
        continue
      }

      // upload to database
      const { data: record, error } = await tryCatch(pb.collection(notesCollection).update(this.recordID, {
        'attachments+': [resourceFile],
      }))

      if (error) {
        console.error('Error uploading resource: ', error.message)
        continue
      }

      if (!record) {
        console.error('Error uploading file to database: ', error.message)
        continue
      }

      const newURL = `src=${baseURL}\/${notesCollection}\/${this.recordID}\/${record.attachments.at(-1)}`
      const resourceURL = `${baseURL}\/${notesCollection}\/${this.recordID}\/${record.attachments.at(-1)}`
      const defaultThumbURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments.at(-1)}`

      // add to list of resources
      const resource = getPocketbaseResource(resourceFile, hash, resourceURL)
      this.resources.push(resource)

      // replace media with new URL
      if (newURL) {
        updatedContent = updatedContent.replace(match[0], newURL)
      }

      // make thumbnail
      if (record.thumbnail) continue
      if (resourceFile.size < 10000) continue
      if (!mimeType.includes('image')) continue
      if (mimeType.includes('svg')) continue
      if (mimeType.includes('ico')) continue

      // // fill in thumbnail
      let thumbnailURL = ''

      // make thumbnail based on type of resource file
      if (mimeType == 'image/gif') {
        thumbnailURL = defaultThumbURL
      } else {
        thumbnailURL = `${defaultThumbURL}?thumb=500x0`
      }

      // update thumbnail
      const { data: thumbRecord, error: thumbError } = await tryCatch(pb.collection(notesCollection).update(this.recordID, {
        'thumbnail': thumbnailURL
      }))

      if (thumbError) {
        console.error('Error updating thumbnail: ', thumbError.message)
      }
    }

    this.content = updatedContent;
  }

  stripCSP() {
    const matchPattern = /<meta http-equiv=["]?Content-Security-Policy["]?[^>]*>/ig
    this.content = this.content.replace(matchPattern, '');
  }

  // centerImage() {
  //   const matchPattern = /<div>\s*(<img[^>]*>)\s*<\/div>/g
  //   this.content = this.content.replace(matchPattern, (_match, imgTag) => `<div class='img-wrapper'>${imgTag}</div>`);
  // }

  async uploadToDB() {
    const sources = [{
      'source': this.source,
      'source_url': this.sourceURL
    }]

    const skeletonData = {
      'title': this.title,
      'added': this.added,
      'description': this.description,
      'weight': 5,
      'notebook': this.selectedNotebookdID,
      'last_score_updated': new Date().toISOString(),
      'sources': JSON.stringify(sources)
    }

    const { data: record, error } = await tryCatch(pb.collection(notesCollection).create(skeletonData))

    if (error) {
      if (error.data.data.title.code == "validation_not_unique") {
        throw new Error('Skipped duplicate note')
      }
      throw (error)
    }

    if (!record) return

    this.recordID = record.id
    // console.log('content', this.content)
    // await this.uploadImg()
    await this.replaceResources(this.content)
    this.stripCSP()
    // this.centerImage()
    // this.content = sanitizeHTMLContent(this.content)

    const data = {
      'content': this.content,
      'original_content': this.content,
      'resources': this.resources,
    }

    const { data: updatedRecord, error: updatedError } = await tryCatch(pb.collection(notesCollection).update(this.recordID, data))

    if (updatedError) {
      console.error('Error updating record: ', updatedError.message, updatedError.data)
    }
  }


  // parseHTMLContent(parsedHTML: Document) {
  //   const bodyContent = parsedHTML.body.innerHTML
  //   const styleTags = [...parsedHTML.querySelectorAll('style')].map(style => style.outerHTML).join('\n')
  //   const htmlContent = `${styleTags} ${bodyContent}`

  //   return htmlContent
  // }

  // parseURL(parsedHTML: Document) {
  //   return parsedHTML.querySelector('meta[property="og:url"]')?.getAttribute('content') || ""
  // }

  // async uploadImg() {
  //   for (const [index, img] of this.parsedHTML.querySelectorAll('img').entries()) {

  //     if (!img.src.includes('data:image')) continue
  //     if (img.src.includes('data:image/svg+xml')) continue

  //     let base64Data = ''
  //     let mimeType = ''

  //     try {
  //       base64Data = img.src.split(',')[1]
  //       mimeType = img.src.split(';')[0].split(':')[1]
  //     } catch (e) {
  //       console.log(e)
  //       continue
  //     }

  //     // convert to file
  //     const imgFile = this.base64ToFile(base64Data, mimeType)

  //     // upload to database
  //     const { data: record, error } = await tryCatch(pb.collection(notesCollection).update(this.recordID, {
  //       'attachments+': [imgFile]
  //     }))

  //     if (error) {
  //       console.error('Error uploading image: ', error.message)
  //     }

  //     if (!record) return

  //     const defaultThumbURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments[0]}`

  //     // fill in thumbnail
  //     if (record.thumbnail == '') {
  //       let thumbnailURL = ''

  //       // make thumbnail based on type of resource file
  //       if (mimeType == 'image/gif') {
  //         thumbnailURL = defaultThumbURL
  //       } else {
  //         thumbnailURL = `${defaultThumbURL}?thumb=500x0`
  //       }

  //       // update thumbnail
  //       await pb.collection(notesCollection).update(this.recordID, {
  //         'thumbnail': thumbnailURL
  //       })
  //     }

  //     // get new filename and url
  //     const newName = record.attachments.at(-1)
  //     const newURL = `${baseURL}/${notesCollection}/${this.recordID}/${newName}`

  //     // replace img src
  //     if (newURL) {
  //       img.setAttribute('src', newURL)
  //     }
  //   }
  //   this.content = this.parseHTMLContent(this.parsedHTML)
  // }
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
  sourceURL: string
  tags: string[]
  recordID: string
  description: string | null
  selectedNotebookdID: string

  constructor(fileContent: string, selectedNotebookID: string) {

    this.recordID = ''
    this.selectedNotebookdID = selectedNotebookID

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
    this.sourceURL = this.enNote['en-export'].note['note-attributes']['source-url']
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
    let binaryStr: string = ''
    let byteArray: Uint8Array<ArrayBuffer>

    try {
      binaryStr = atob(resource.data['#text']);
      byteArray = new Uint8Array(binaryStr.length)
    } catch (err) {
      console.error('Error converting resource file')
      return
    }

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
    let files: File[] = []
    for (const [index, resource] of this.enResources.entries()) {
      if (!resource) continue

      // converts to binary
      const binaryStr = atob(resource.data['#text']);

      // adds hash
      resource.hash = SparkMD5.hashBinary(binaryStr);

      // adds file and converts to file
      resource.file = this.convertResourceToFile(resource)

      // upload to database
      const { data: record, error: uploadError } = await tryCatch(pb.collection(notesCollection).update(this.recordID, {
        'attachments+': [resource.file]
      }))

      if (uploadError) {
        console.error('Error updating record: ', uploadError.message, uploadError.data)
        continue
      }

      if (!record) continue

      // console.log(resource)
      resource.name = record.attachments[index]
      resource.fileURL = `${baseURL}/${notesCollection}/${this.recordID}/${resource.name}`

      if (!resource.file) continue

      files.push(resource.file)
    }

    await createThumbnail(this.recordID, files)
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
    if (this.tags.length == 1 && this.tags[0] == '') return ['']

    const tagList: string[] = []

    const { data: existingTags, error } = await tryCatch<RecordModel[], PError>(pb.collection('tags').getFullList())

    if (error) {
      console.error('Unable to get all tags: ', error.message)
      return ['']
    }

    if (!existingTags) return ['']

    const existingTagNames = new Set(existingTags.map((tag: { name: string }) => tag.name))

    for (const tag of this.tags) {
      if (existingTagNames.has(tag.toLowerCase())) {
        const record = existingTags.find((record: { name: string }) => record.name === tag.toLowerCase())
        tagList.push(record.id)
      } else {
        const { data: newTag, error: newTagError } = await tryCatch<RecordModel[], PError>(pb.collection('tags').create({ 'name': tag.toLowerCase() }))

        if (newTagError) {
          console.error('Unable to make new tags: ', newTagError.message, tag)
          return ['']
        }

        if (!newTag) return ['']

        tagList.push(newTag.id)
      }
    }
    return tagList
  }

  getPocketbaseResources(enResources: EnResource[]) {
    let resources: Resource[] = []
    for (const enResource of enResources) {
      const resource: Resource = {
        name: enResource.name,
        size: enResource.file?.size,
        hash: enResource.hash,
        type: enResource.mime,
        fileURL: enResource.fileURL,
        lastUpdated: new Date().toISOString(),
        sourceURL: enResource['resource-attributes']['source-url'],
        width: enResource.width,
        height: enResource.height,
        latitude: enResource['resource-attributes'].latitude,
        longitude: enResource['resource-attributes'].longitude,
        timestamp: enResource['resource-attributes'].timestamp,
        cameraMake: enResource['resource-attributes']['camera-make']
      }
      resources.push(resource)
    }
    return resources
  }

  async uploadToDB() {
    const tags = await this.addTags()
    const sources = [{
      'source': this.source,
      'source_url': this.sourceURL
    }]
    const skeletonData = {
      'title': this.title,
      'added': this.added,
      'tags': tags,
      'weight': 5,
      'notebook': this.selectedNotebookdID,
      'last_score_updated': new Date().toISOString(),
      'sources': JSON.stringify(sources),
    }

    const { data: record, error } = await tryCatch<RecordModel, PError>(pb.collection(notesCollection).create(skeletonData))

    if (error) {
      if (error.data.data.title.code == "validation_not_unique") {
        throw new Error('Skipped duplicate note')
      }
      console.log('Error uploading file: ', error.message, error.data)
      throw (error)
    }

    this.recordID = record.id

    await this.uploadResources()
    this.replaceEnMedia()
    // this.content = sanitizeContent(this.content)
    this.description = createDescription(this.content)
    const resources = this.getPocketbaseResources(this.enResources)

    const data = {
      'content': this.content,
      'original_content': this.content,
      'description': this.description,
      'resources': resources
    }

    const { data: updatedRecord, error: updatedError } = await tryCatch(pb.collection(notesCollection).update(this.recordID, data))

    if (updatedError) {
      console.error('Error updating record: ', updatedError.message, error.data)
    }
  }
}

export class fileImport {
  title: string
  file: File
  mimeType: string
  content: string
  added: string
  fileURL: string
  recordID: string
  selectedNotebookdID: string

  constructor(file: File, selectedNotebookID: string) {
    this.file = file
    this.mimeType = file.type
    this.recordID = ''
    this.fileURL = ''
    this.content = ''
    this.title = `${file.name} ${dayjs(Date()).format('MM-DD-YYYY')}`
    this.selectedNotebookdID = selectedNotebookID
    this.added = new Date().toISOString()
  }

  async uploadResources() {
    const { data: record, error } = await tryCatch<RecordModel, PError>(pb.collection(notesCollection).update(this.recordID, {
      'attachments+': [this.file]
    }))

    if (error) {
      console.error('Error adding attachments: ', error.message)
    }

    if (!record) return

    await createThumbnail(this.recordID, [this.file])
    // update attachment URL
    this.fileURL = `${baseURL}/${notesCollection}/${this.recordID}/${record.attachments[0]}`
  }

  async uploadToDB() {

    const skeletonData = {
      'title': this.title,
      'notebook': this.selectedNotebookdID,
      'last_score_updated': new Date().toISOString(),
      'weight': 5,
      'added': this.added
    }

    const { data: record, error } = await tryCatch<RecordModel, PError>(pb.collection(notesCollection).create(skeletonData))

    if (error) {
      if (error.data.data.title.code == "validation_not_unique") {
        throw new Error('Skipped duplicate note')
      }
      throw (error)
    }

    if (!record) return
    this.recordID = record.id

    await this.uploadResources()
    this.content = addMediaToContent(this.mimeType, this.fileURL, this.file.name)
    const hash = await getFileHash(this.file)
    const resource = getPocketbaseResource(this.file, hash, this.fileURL)

    const data = {
      'content': this.content,
      'original_content': this.content,
      'resources': [resource]
    }

    const { data: updatedRecord, error: updatedError } = await tryCatch(pb.collection(notesCollection).update(this.recordID, data))

    if (updatedError) {
      console.error('Error updating record: ', updatedError.message)
    }
  }
}
