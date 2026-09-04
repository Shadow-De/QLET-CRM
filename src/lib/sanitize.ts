/**
 * DOMPurify wrapper for server-side sanitization.
 * Strips HTML/script tags from user-submitted text to prevent stored XSS.
 */
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],     // No HTML allowed — plain text only
    ALLOWED_ATTR: [],
  }).trim()
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeText(result[key] as string) as T[typeof key]
    }
  }
  return result
}
