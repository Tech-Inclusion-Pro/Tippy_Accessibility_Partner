export interface ReadabilityScores {
  fleschKincaid: number
  gradeLevel: number
  avgSentenceLength: number
  avgSyllablesPerWord: number
  passiveVoiceCount: number
  complexWordCount: number
  wordCount: number
  sentenceCount: number
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

function isPassiveVoice(sentence: string): boolean {
  const passivePattern =
    /\b(am|is|are|was|were|be|been|being)\s+([\w]+ed|[\w]+en)\b/i
  return passivePattern.test(sentence)
}

function isComplexWord(word: string): boolean {
  return countSyllables(word) >= 3
}

export function analyzeReadability(text: string): ReadabilityScores {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const words = text
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z']/g, ''))
    .filter((w) => w.length > 0)

  const sentenceCount = Math.max(sentences.length, 1)
  const wordCount = words.length
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0)
  const avgSentenceLength = wordCount / sentenceCount
  const avgSyllablesPerWord = totalSyllables / Math.max(wordCount, 1)

  // Flesch-Kincaid Reading Ease
  const fleschKincaid =
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord

  // Flesch-Kincaid Grade Level
  const gradeLevel =
    0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59

  const passiveVoiceCount = sentences.filter(isPassiveVoice).length
  const complexWordCount = words.filter(isComplexWord).length

  return {
    fleschKincaid: Math.round(fleschKincaid * 10) / 10,
    gradeLevel: Math.round(gradeLevel * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
    passiveVoiceCount,
    complexWordCount,
    wordCount,
    sentenceCount
  }
}
