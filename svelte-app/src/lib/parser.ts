import { XMLParser } from 'fast-xml-parser'
import SparkMD5 from 'spark-md5';
import type { EnNote, EnMedia, EnResource } from './types';
import pb from '$lib/db'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
})

export class htmlImport {
  title: string
  content: string
  parsedHTML: Document
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

    const { parsedHTML, htmlContent, title } = this.parseHTML(fileContent)
    this.title = title
    this.parsedHTML = parsedHTML
    this.content = htmlContent
    this.created = ''
    this.updated = ''
    this.source = ''
    this.sourceUrl = ''
    this.tags = ['']
  }

  parseHTML(fileContent: string) {
    const parser = new DOMParser()
    const parsedHTML = parser.parseFromString(fileContent, 'text/html')
    const title = parsedHTML.querySelector('title')?.textContent || 'Untitled'
    const bodyContent = parsedHTML.body.innerHTML
    const styleTags = [...parsedHTML.querySelectorAll('style')].map(style => style.outerHTML).join('\n')
    const htmlContent = `${styleTags} ${bodyContent}`

    return {
      parsedHTML, htmlContent, title
    }
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
    const imgElements = this.parsedHTML.querySelectorAll('img')
    for (const [index, img] of imgElements.entries()) {

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
          thumbnailURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${record.attachments[0]}`
        } else {
          thumbnailURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${record.attachments[0]}?thumb=500x0`
        }

        // update thumbnail
        await pb.collection('notes').update(this.recordID, {
          'thumbnail': thumbnailURL
        })
      }

      // get new filename and url
      const newName = record.attachments[index]
      const newURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${newName}`

      // replace img src
      img.setAttribute('src', newURL)
    }
  }


  async uploadToDB() {
    const skeletonData = {
      'title': this.title,
    }

    const record = await pb.collection('notes').create(skeletonData)
    this.recordID = record.id

    await this.uploadImg()

    const data = {
      'content': this.content,
    }

    console.log(data)

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

    const { xmlNote, xmlMedia, xmlContent } = this.parseEnex(fileContent)

    this.enNote = xmlNote
    this.content = xmlContent
    this.enMedias = Array.isArray(xmlMedia) ? xmlMedia : [xmlMedia]

    const tags = this.enNote['en-export'].note.tags
    this.xmlResource = xmlNote["en-export"]['note']['resource']
    this.enResources = Array.isArray(this.xmlResource) ? this.xmlResource : [this.xmlResource]
    this.title = this.enNote['en-export'].note.title
    this.created = this.enNote['en-export'].note.created
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
        video.currentTime = 1; // Capture at 2 seconds
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
          thumbnailURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${record.attachments[0]}`
        } else if (resource.mime == 'video/mp4') {
          const videoURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${record.attachments[0]}`
          const thumbnailFile = await this.getVideoThumb(videoURL)
          const thumbedRecord = await pb.collection('notes').update(this.recordID, {
            'attachments+': [thumbnailFile]
          })
          thumbnailURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${thumbedRecord.attachments[1]}?thumb=500x0`
        }
        else {
          thumbnailURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${record.attachments[0]}?thumb=500x0`
        }

        // update thumbnail
        await pb.collection('notes').update(this.recordID, {
          'thumbnail': thumbnailURL
        })
      }

      // get new filename and url
      const newName = record.attachments[index]
      const newURL = `${this.baseURL}/${this.collectionID}/${this.recordID}/${newName}`
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

      return `<media src=${resource[0].fileURL} type=${resource[0].mime}>`
    }

    this.content = this.content.replace(mediaMatch, replaceMedia);
  }

  async uploadToDB() {
    const skeletonData = {
      'title': this.title,
    }

    const record = await pb.collection('notes').create(skeletonData)
    this.recordID = record.id

    await this.uploadResources()
    this.replaceEnMedia()

    const data = {
      'content': this.content,
    }

    await pb.collection('notes').update(this.recordID, data)
  }
}
