import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType
} from 'docx'

interface DocxExportOptions {
  content: string
  title?: string
  frameworks?: string[]
}

export async function generateDocx(options: DocxExportOptions): Promise<Buffer> {
  const { content, title = 'TIPPY Accessibility Analysis', frameworks = [] } = options

  const children: Paragraph[] = []

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 }
    })
  )

  // Date and frameworks
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          size: 20,
          color: '666666'
        })
      ],
      spacing: { after: 100 }
    })
  )

  if (frameworks.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Frameworks: ${frameworks.join(', ')}`,
            size: 20,
            color: '666666'
          })
        ],
        spacing: { after: 300 }
      })
    )
  }

  // Separator
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(60), color: 'CCCCCC' })],
      spacing: { after: 300 }
    })
  )

  // Parse markdown content into docx paragraphs
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      children.push(new Paragraph({ spacing: { after: 100 } }))
      continue
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        })
      )
    } else if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 }
        })
      )
    } else if (trimmed.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        })
      )
    }
    // Bullet lists
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.slice(2)
      children.push(
        new Paragraph({
          children: parseInlineFormatting(bulletText),
          bullet: { level: 0 },
          spacing: { after: 50 }
        })
      )
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const listText = trimmed.replace(/^\d+\.\s/, '')
      children.push(
        new Paragraph({
          children: parseInlineFormatting(listText),
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { after: 50 }
        })
      )
    }
    // Regular paragraphs
    else {
      children.push(
        new Paragraph({
          children: parseInlineFormatting(trimmed),
          spacing: { after: 100 }
        })
      )
    }
  }

  const doc = new Document({
    creator: 'TIPPY - Accessibility Partner',
    title,
    description: 'WCAG-compliant accessibility analysis report',
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 24
          }
        }
      }
    },
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.START
            }
          ]
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }
    ]
  })

  const buffer = await Packer.toBuffer(doc)
  return Buffer.from(buffer)
}

function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = []
  // Match **bold** and regular text
  const parts = text.split(/(\*\*[^*]+\*\*)/)

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          bold: true
        })
      )
    } else if (part) {
      runs.push(new TextRun({ text: part }))
    }
  }

  return runs
}
