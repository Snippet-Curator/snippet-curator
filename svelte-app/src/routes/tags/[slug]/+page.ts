import pb from '$lib/db'

export async function load({ params }) {
  const tagID = params.slug
  const tag = await pb.collection('tags').getOne(tagID)

  return {
    tag
  }
}