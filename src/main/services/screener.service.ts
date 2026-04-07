import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join, basename } from 'path'
import { app } from 'electron'

export interface ScreenerFile {
  id: string
  name: string
  filename: string
  content: string
  builtIn: boolean
  framework: string // 'wcag' | 'udl' | 'discrit' | 'custom'
}

const FRAMEWORK_MAP: Record<string, string> = {
  '01_WCAG_Accessibility_Screener.md': 'wcag',
  '02_UDL_Screener.md': 'udl',
  '03_DisCrit_Inclusive_Identity_Screener.md': 'discrit'
}

class ScreenerService {
  private screeners: ScreenerFile[] = []
  private builtInDir = ''
  private customDir = ''

  load(): void {
    this.screeners = []

    // Built-in screeners from app resources
    if (app.isPackaged) {
      this.builtInDir = join(process.resourcesPath, 'data', 'screeners')
    } else {
      this.builtInDir = join(__dirname, '../../data/screeners')
      // Fallback: try project root
      if (!existsSync(this.builtInDir)) {
        this.builtInDir = join(process.cwd(), 'data', 'screeners')
      }
    }

    // Custom screeners in user data directory
    this.customDir = join(app.getPath('userData'), 'custom-screeners')
    if (!existsSync(this.customDir)) {
      mkdirSync(this.customDir, { recursive: true })
    }

    // Load built-in screeners
    if (existsSync(this.builtInDir)) {
      const files = readdirSync(this.builtInDir).filter((f) => f.endsWith('.md'))
      for (const file of files) {
        const content = readFileSync(join(this.builtInDir, file), 'utf-8')
        const name = this.extractTitle(content) || file.replace('.md', '').replace(/^\d+_/, '')
        const framework = FRAMEWORK_MAP[file] || 'custom'
        this.screeners.push({
          id: `builtin:${file}`,
          name,
          filename: file,
          content,
          builtIn: true,
          framework
        })
      }
    }

    // Load custom screeners
    if (existsSync(this.customDir)) {
      const files = readdirSync(this.customDir).filter((f) => f.endsWith('.md'))
      for (const file of files) {
        const content = readFileSync(join(this.customDir, file), 'utf-8')
        const name = this.extractTitle(content) || file.replace('.md', '')
        this.screeners.push({
          id: `custom:${file}`,
          name,
          filename: file,
          content,
          builtIn: false,
          framework: 'custom'
        })
      }
    }
  }

  getAll(): Omit<ScreenerFile, 'content'>[] {
    return this.screeners.map(({ content: _, ...rest }) => rest)
  }

  getContent(id: string): string | null {
    const screener = this.screeners.find((s) => s.id === id)
    return screener?.content ?? null
  }

  getScreenersForFrameworks(frameworks: string[]): ScreenerFile[] {
    return this.screeners.filter(
      (s) => frameworks.includes(s.framework) || s.framework === 'custom'
    )
  }

  getAllScreeners(): ScreenerFile[] {
    return this.screeners
  }

  addCustom(filename: string, content: string): ScreenerFile {
    // Sanitize filename
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const finalName = safeName.endsWith('.md') ? safeName : `${safeName}.md`
    const filePath = join(this.customDir, finalName)

    writeFileSync(filePath, content, 'utf-8')

    const name = this.extractTitle(content) || finalName.replace('.md', '')
    const screener: ScreenerFile = {
      id: `custom:${finalName}`,
      name,
      filename: finalName,
      content,
      builtIn: false,
      framework: 'custom'
    }

    // Replace if already exists
    const existingIdx = this.screeners.findIndex((s) => s.id === screener.id)
    if (existingIdx >= 0) {
      this.screeners[existingIdx] = screener
    } else {
      this.screeners.push(screener)
    }

    return screener
  }

  deleteCustom(id: string): boolean {
    const screener = this.screeners.find((s) => s.id === id)
    if (!screener || screener.builtIn) return false

    const filePath = join(this.customDir, screener.filename)
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }

    this.screeners = this.screeners.filter((s) => s.id !== id)
    return true
  }

  getFilePath(id: string): string | null {
    const screener = this.screeners.find((s) => s.id === id)
    if (!screener) return null

    if (screener.builtIn) {
      return join(this.builtInDir, screener.filename)
    }
    return join(this.customDir, screener.filename)
  }

  private extractTitle(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m)
    return match ? match[1].trim() : null
  }
}

export const screenerService = new ScreenerService()
