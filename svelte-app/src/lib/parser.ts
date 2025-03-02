import { XMLParser } from 'fast-xml-parser'
import SparkMD5 from 'spark-md5';
import sanitizeHTML from 'sanitize-html';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'

import type { EnNote, EnMedia, EnResource } from './types';
import pb from '$lib/db'

dayjs.extend(customParseFormat)

const collectionID = 'notes'
const baseURL = 'http://127.0.0.1:8090/api/files'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
})

async function getDefaultNotebook() {
  return await pb.collection('notebooks').getFirstListItem('name="Inbox"')
}

export function sanitizeContent(content: string) {
  const cleanContent = sanitizeHTML(content, {
    allowedTags: sanitizeHTML.defaults.allowedTags.concat([
      'img',
      'form',
      'svg',
      'code',
      'style',
      'video',
      'source'
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
      div: function (tagName, attribs) {
        let newStyle =
          'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;';
        attribs.style = attribs.style ? `${attribs.style};${newStyle}` : newStyle;
        return {
          tagName: 'div',
          attribs: attribs
        };
      },
      pre: sanitizeHTML.simpleTransform('pre', {
        style:
          'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;'
      }),
      p: sanitizeHTML.simpleTransform('p', {
        style:
          'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;'
      })
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

  constructor(fileContent: string) {
    this.recordID = ''

    const { parsedHTML, title } = this.parseHTML(fileContent)
    this.title = title
    this.parsedHTML = parsedHTML
    this.content = this.parseHTMLContent(this.parsedHTML)
    this.source = 'SingleFile clip'
    this.sourceUrl = this.parseURL(this.parsedHTML)
    this.added = new Date().toISOString()
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
          thumbnailURL = `${baseURL}/${collectionID}/${this.recordID}/${record.attachments[0]}`
        } else {
          thumbnailURL = `${baseURL}/${collectionID}/${this.recordID}/${record.attachments[0]}?thumb=500x0`
        }

        // update thumbnail
        await pb.collection('notes').update(this.recordID, {
          'thumbnail': thumbnailURL
        })
      }

      // get new filename and url
      const newName = record.attachments[index]
      const newURL = `${baseURL}/${collectionID}/${this.recordID}/${newName}`

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
      'sourceURL': this.sourceUrl,
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

    const data = {
      'content': this.content,
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

  constructor(fileContent: string) {

    this.recordID = ''

    const { xmlNote, xmlMedia, xmlContent } = this.parseEnex(fileContent)

    this.enNote = xmlNote
    this.content = xmlContent
    this.enMedias = Array.isArray(xmlMedia) ? xmlMedia : [xmlMedia]

    const tags = this.enNote['en-export'].note.tag
    this.xmlResource = xmlNote["en-export"]['note']['resource']
    this.enResources = Array.isArray(this.xmlResource) ? this.xmlResource : [this.xmlResource]
    this.title = this.enNote['en-export'].note.title
    this.added = dayjs(this.enNote['en-export'].note.created, 'YYYYMMDDTHHmmss[Z]').toISOString()
    this.updated = this.enNote['en-export'].note.updated
    this.source = this.enNote['en-export'].note['note-attributes'].source
    this.sourceUrl = this.enNote['en-export'].note['note-attributes']['source-url']
    this.tags = Array.isArray(tags) ? tags : [tags]
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

  async getVideoThumb(videoUrl: string) {

    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous"; // Prevent CORS issues
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = 1; // Capture at 1 second
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth; // Resize to reduce file size
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to Blob and create a File
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], "thumbnail.png", { type: "image/png" });
            resolve(thumbnailFile)
          }
        }, "image/png");
      };
    })
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

      // fill in thumbnail
      if (record.thumbnail == '') {
        let thumbnailURL = ''

        // make thumbnail based on type of resource file
        if (resource.mime == 'image/gif') {
          thumbnailURL = `${baseURL}/${collectionID}/${this.recordID}/${record.attachments[0]}`
        } else if (resource.mime == 'video/mp4') {
          const videoURL = `${baseURL}/${collectionID}/${this.recordID}/${record.attachments[0]}`
          const thumbnailFile = await this.getVideoThumb(videoURL)
          const thumbedRecord = await pb.collection('notes').update(this.recordID, {
            'attachments+': [thumbnailFile]
          })
          thumbnailURL = `${baseURL}/${collectionID}/${this.recordID}/${thumbedRecord.attachments[1]}?thumb=500x0`
        }
        else {
          thumbnailURL = `${baseURL}/${collectionID}/${this.recordID}/${record.attachments[0]}?thumb=500x0`
        }

        // update thumbnail
        await pb.collection('notes').update(this.recordID, {
          'thumbnail': thumbnailURL
        })
      }

      // get new filename and url
      const newName = record.attachments[index]
      const newURL = `${baseURL}/${collectionID}/${this.recordID}/${newName}`
      resource.fileURL = newURL
    }

  }

  replaceEnMedia() {
    const mediaMatch = /<en-media[^>]+?hash="([a-zA-Z0-9]+)"[^>]*\/?>/g

    if (this.enResources.length == 0) return

    const replaceMedia = (match: string, hash: string) => {
      const resource = this.enResources.filter((resource) => {
        return resource.hash == hash
      })

      if (resource.length == 0) return

      if (resource[0].mime.includes('image')) {
        return `<img style='max-width: 100%; height: auto' src=${resource[0].fileURL} type=${resource[0].mime}>`;
      }

      if (resource[0].mime == 'video/mp4') {
        return `<video style='width:100%' controls><source src=${resource[0].fileURL} type=${resource[0].mime} />Your browser does not support the video tag.</video>`
      }
    }

    this.content = this.content.replace(mediaMatch, replaceMedia);
  }

  async addTags() {
    const tagList: string[] = []
    for (const tag of this.tags) {
      try {
        const record = await pb.collection('tags').getFirstListItem(`name="${tag}"`)
        tagList.push(record.id)
      } catch {
        const newTagRecord = await pb.collection('tags').create({ 'name': tag })
        tagList.push(newTagRecord.id)
      }
    }
    return tagList
  }

  async uploadToDB() {
    const defaultNotebook = await getDefaultNotebook()
    const tags = await this.addTags()


    const skeletonData = {
      'title': this.title,
      'added': this.added,
      'source': this.source,
      'sourceURL': this.sourceUrl,
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

    const data = {
      'content': this.content,
    }

    await pb.collection('notes').update(this.recordID, data)
  }
}
