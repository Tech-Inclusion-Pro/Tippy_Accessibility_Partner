import { readFileSync, statSync } from 'fs'
import { extname, basename } from 'path'
import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.html', '.docx', '.pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export interface ExtractedFile {
  text: string
  filename: string
  extension: string
  sizeBytes: number
}

export async function extractTextFromFile(filePath: string): Promise<ExtractedFile> {
  const ext = extname(filePath).toLowerCase()
  const filename = basename(filePath)

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Unsupported file type "${ext}". Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`
    )
  }

  const stat = statSync(filePath)
  if (stat.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(stat.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`)
  }

  let text: string

  switch (ext) {
    case '.txt':
    case '.md':
      text = readFileSync(filePath, 'utf-8')
      break

    case '.html': {
      const html = readFileSync(filePath, 'utf-8')
      text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      break
    }

    case '.docx': {
      const buffer = readFileSync(filePath)
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
      break
    }

    case '.pdf': {
      const buffer = readFileSync(filePath)
      const result = await pdfParse(buffer)
      text = result.text
      break
    }

    default:
      throw new Error(`Unsupported file type: ${ext}`)
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Could not extract any text from the file.')
  }

  return { text: text.trim(), filename, extension: ext, sizeBytes: stat.size }
}

export function getSupportedExtensions(): string[] {
  return [...SUPPORTED_EXTENSIONS]
}
