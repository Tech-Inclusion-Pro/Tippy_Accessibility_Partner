import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'

export interface WCAGCriterion {
  id: string
  name: string
  level: 'A' | 'AA'
  principle: 'perceivable' | 'operable' | 'understandable' | 'robust'
  description: string
  plainLanguageSummary: string
  whoItHelps: string[]
  commonFailures: string[]
  techniques: string[]
}

let criteria: WCAGCriterion[] = []

function getDataPath(): string {
  if (is.dev) {
    // In dev, data is at project root
    return join(__dirname, '../../data/wcag-2.1-aa.json')
  }
  // In production, data is in extraResources
  return join(process.resourcesPath, 'data/wcag-2.1-aa.json')
}

export function loadWCAGData(): void {
  try {
    const dataPath = getDataPath()
    if (!existsSync(dataPath)) {
      console.warn('[TIPPY] WCAG data file not found at', dataPath)
      criteria = []
      return
    }
    const raw = readFileSync(dataPath, 'utf-8')
    criteria = JSON.parse(raw)
    console.log(`[TIPPY] Loaded ${criteria.length} WCAG criteria`)
  } catch (err) {
    console.warn('[TIPPY] Could not load WCAG data file:', err)
    criteria = []
  }
}

export function getAllCriteria(): WCAGCriterion[] {
  return criteria
}

export function getCriterion(id: string): WCAGCriterion | undefined {
  return criteria.find((c) => c.id === id)
}

export function getCriteriaByPrinciple(
  principle: WCAGCriterion['principle']
): WCAGCriterion[] {
  return criteria.filter((c) => c.principle === principle)
}

export function searchCriteria(query: string): WCAGCriterion[] {
  const q = query.toLowerCase()
  return criteria.filter(
    (c) =>
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.plainLanguageSummary.toLowerCase().includes(q)
  )
}
