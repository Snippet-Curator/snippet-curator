// import pb from '$lib/db'

// export async function getNotesByPage(clickedPage: number, notebookID: string) {
//   const notes = await pb.collection('notes').getList(clickedPage, 25, {
//     filter: `notebook = "${notebookID}"`,
//     expand: 'tags'
//   });
//   console.log('utils', notes)
//   return notes
// }

export function categorizeMediabyType(content: string) {
  const mediaMatch =
    /<media\s+src=["']?(?<src>[^"'\s>]+)["']?\s+type=["']?(?<type>[^"'\s>]+)["']?\s*>/g;

  const replaceMedia = (match: string, src: string, type: string) => {

    console.log(type)
    if (type.includes('image')) {
      return `<img style='max-width: 100%; height: auto' src=${src}>`;
    }

    if (type == 'video/mp4') {
      return `<video style='width:100%' controls class="w-full mx-auto rounded-md shadow-md"><source src=${src} type=${type} />Your browser does not support the video tag.</video>`
    }
  };

  return content.replace(mediaMatch, replaceMedia);
}