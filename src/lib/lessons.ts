import { getCollection, type CollectionEntry } from 'astro:content'
import { url } from './url'

export type Lesson = CollectionEntry<'lessons'>

/** All lessons, 科目一 before 科目二, then by `order`. */
export async function getLessons(): Promise<Lesson[]> {
  const all = await getCollection('lessons')
  return all.sort((a, b) =>
    a.data.subject.localeCompare(b.data.subject) || a.data.order - b.data.order
  )
}

export const lessonUrl = (l: Lesson) => url(`${l.data.subject}/${l.id}/`)
