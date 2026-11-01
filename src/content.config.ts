import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const question = z.object({
  id: z.string(),
  code: z.string().optional(),
  stem: z.string(),
  options: z.array(z.object({ text: z.string(), why: z.string() })).length(4),
  answer: z.number().int().min(0).max(3)
})

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    subject: z.enum(['l11', 'l12']),
    code: z.string().regex(/^L1[12]\d{3}$/),
    order: z.number(),
    minutes: z.number(),
    emoji: z.string(),
    quiz: z.array(question).default([])
  })
})

export const collections = { lessons }

export type QuizQuestion = z.infer<typeof question>
