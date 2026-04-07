# TIPPY - AI Accessibility & Inclusion Partner

TIPPY is a cross-platform desktop application that serves as your AI accessibility and inclusion partner. It provides conversational analysis through WCAG 2.1 AA, Universal Design for Learning (UDL), Disability Critical Race Theory (DisCrit), and Plain Language frameworks.

## Features

- **Text Analysis** — Paste text to get readability scores (Flesch-Kincaid) and AI-powered plain language suggestions
- **URL Analysis** — Enter a URL to run automated accessibility scans (axe-core) with AI-powered remediation guidance
- **Chat Interface** — Have conversations with TIPPY about accessibility topics
- **Multi-Framework Analysis** — Toggle between WCAG, UDL, DisCrit, and Plain Language frameworks
- **Local-First AI** — Use Ollama for fully local analysis (no data leaves your machine)
- **Cloud AI Option** — Bring your own Anthropic API key for cloud-powered analysis
- **Audit History** — All analyses are saved locally for reference
- **Desktop Widget** — Floating mini widget with global shortcut (Cmd/Ctrl+Shift+T)
- **Accessible by Design** — Built with WCAG 2.1 AA compliance, keyboard navigation, screen reader support

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Ollama (recommended, for local AI) — [Install Ollama](https://ollama.ai)

### Setup

```bash
# Clone the repo
git clone https://github.com/Tech-Inclusion-Pro/Tippy_Accessibility_Partner.git
cd Tippy_Accessibility_Partner

# Install dependencies
npm install

# Pull an AI model (if using Ollama)
ollama pull gemma3:4b

# Start in development mode
npm run dev
```

### Optional: URL Analysis

To enable URL accessibility scanning, install Playwright:

```bash
npm install playwright @axe-core/playwright
npx playwright install chromium
```

## Usage

1. **Widget** — TIPPY appears as a floating widget in the top-right corner
2. **Expand** — Click the avatar or press Cmd/Ctrl+Shift+T to open the full panel
3. **Chat** — Type questions about accessibility or paste content for analysis
4. **URL Scan** — Paste a URL to run an automated accessibility audit
5. **Settings** — Configure your AI provider (Ollama local or Anthropic cloud)
6. **History** — View past analyses in the History tab

## Architecture

- **Electron** + **React 18** + **TypeScript**
- **electron-vite** for fast development and building
- **TailwindCSS 4** for styling
- **Zustand** for state management
- **better-sqlite3** for local database (audit history + settings)
- **Electron safeStorage** for encrypted API key storage

## Building

```bash
# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE)

---

Built with care by [Tech Inclusion Pro](https://techinclusion.pro)
