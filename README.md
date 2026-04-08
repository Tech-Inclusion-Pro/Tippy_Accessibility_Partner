<p align="center">
  <img src="docs/tippy-logo.png" alt="TIPPY - AI Accessibility & Inclusion Partner" width="200" />
</p>

<h1 align="center">TIPPY - AI Accessibility & Inclusion Partner</h1>

<p align="center">
  Your desktop AI companion for accessibility, inclusion, and plain language analysis.
</p>

---

TIPPY is a cross-platform desktop application that serves as your AI accessibility and inclusion partner. It provides conversational analysis through **WCAG 2.1 AA**, **Universal Design for Learning (UDL)**, **Disability Critical Race Theory (DisCrit)**, and **Plain Language** frameworks.

TIPPY lives on your desktop as a floating, draggable widget — always ready to help. Click the icon to ask a question, or open the full panel for in-depth analysis.

## Download

Download the latest release for your platform:

| Platform | Download | Notes |
|----------|----------|-------|
| macOS (Apple Silicon) | [tippy-desktop-1.0.0-arm64.dmg](https://github.com/Tech-Inclusion-Pro/Tippy_Accessibility_Partner/releases/download/v1.0.0/tippy-desktop-1.0.0-arm64.dmg) | For M1/M2/M3/M4 Macs |
| macOS (Intel) | [tippy-desktop-1.0.0-x64.dmg](https://github.com/Tech-Inclusion-Pro/Tippy_Accessibility_Partner/releases/download/v1.0.0/tippy-desktop-1.0.0-x64.dmg) | For older Intel-based Macs |
| Windows | [tippy-desktop-1.0.0-setup.exe](https://github.com/Tech-Inclusion-Pro/Tippy_Accessibility_Partner/releases/download/v1.0.0/tippy-desktop-1.0.0-setup.exe) | Windows installer (64-bit) |
| Linux (AppImage) | [tippy-desktop-1.0.0-x86_64.AppImage](https://github.com/Tech-Inclusion-Pro/Tippy_Accessibility_Partner/releases/download/v1.0.0/tippy-desktop-1.0.0-x86_64.AppImage) | Portable Linux app (64-bit) |
| Linux (Debian/Ubuntu) | [tippy-desktop_1.0.0_amd64.deb](https://github.com/Tech-Inclusion-Pro/Tippy_Accessibility_Partner/releases/download/v1.0.0/tippy-desktop_1.0.0_amd64.deb) | `.deb` package (64-bit) |

> [View all releases](https://github.com/Tech-Inclusion-Pro/Tippy_Accessibility_Partner/releases)

### Installation Instructions

<details>
<summary><strong>macOS</strong></summary>

1. Download the `.dmg` file for your Mac type (Apple Silicon or Intel)
2. Open the `.dmg` file
3. Drag **TIPPY - Accessibility Partner** to your **Applications** folder
4. On first launch, right-click the app and select **Open** (required to bypass macOS Gatekeeper for unsigned apps)
5. TIPPY will appear as a floating widget on your desktop

> **Not sure which Mac you have?** Click the Apple menu > **About This Mac**. If you see "Apple M1/M2/M3/M4" under Chip, download the Apple Silicon version. If you see "Intel", download the Intel version.

</details>

<details>
<summary><strong>Windows</strong></summary>

1. Download `tippy-desktop-1.0.0-setup.exe`
2. Run the installer and follow the setup wizard
3. Launch TIPPY from the Start menu or desktop shortcut

</details>

<details>
<summary><strong>Linux</strong></summary>

**AppImage (any distro):**
```bash
chmod +x tippy-desktop-1.0.0-x86_64.AppImage
./tippy-desktop-1.0.0-x86_64.AppImage
```

**Debian/Ubuntu (.deb):**
```bash
sudo dpkg -i tippy-desktop_1.0.0_amd64.deb
```

</details>

### AI Provider Setup

TIPPY requires an AI provider to function. On first launch, the setup wizard will guide you through configuration:

- **Ollama (recommended)** — Free, local, and private. No data leaves your machine. [Install Ollama](https://ollama.ai), then run `ollama pull gemma3:4b`
- **Anthropic (Claude)** — Bring your own API key from [console.anthropic.com](https://console.anthropic.com)
- **OpenAI (GPT)** — Bring your own API key from [platform.openai.com](https://platform.openai.com)
- **Google Gemini** — Bring your own API key from [aistudio.google.com](https://aistudio.google.com)

## Features

- **Floating Desktop Widget** — Draggable TIPPY icon that lives on your desktop; click to open the full panel
- **Text Analysis** — Paste text to get readability scores (Flesch-Kincaid) and AI-powered plain language suggestions
- **URL Analysis** — Enter a URL to run automated accessibility scans (axe-core) with AI-powered remediation guidance
- **Document Analysis** — Upload files (PDF, DOCX, TXT, HTML) for accessibility review with drag-and-drop support
- **Per-Screener Reports** — File analyses produce separate report sections for each active screener (WCAG, UDL, DisCrit) with Findings, Recommendations, and Strengths
- **Custom Screener Guidance** — When custom screeners are loaded, a conversation starter modal lets you provide a guiding question to focus the analysis
- **Chat Interface** — Have conversations with TIPPY about accessibility topics with natural, contextual responses
- **Chat Session Management** — Save chat sessions to history, start new chats, or end sessions with automatic saving
- **Multi-Framework Analysis** — Toggle between WCAG, UDL, DisCrit, and Plain Language frameworks
- **Local-First AI** — Use Ollama for fully local analysis (no data leaves your machine)
- **Multi-Provider Cloud AI** — Bring your own API key for Anthropic, OpenAI, or Google Gemini
- **About Me Personalization** — Enter your name and work context so TIPPY tailors responses to you
- **First-Time Setup Wizard** — Guided onboarding walks you through personalization and provider setup
- **Audit History** — All analyses are saved locally; delete individual items from the list or detail view
- **History Search** — Full-text search across history inputs and results with 300ms debounced filtering
- **Type Filtering** — Filter history by type (Text, URL, Chat, File) using toggleable chips
- **Folders** — Create, rename, and delete folders to organize history items; move items between folders from the list or detail view
- **Custom Database Location** — Choose where your history database is stored on your computer via Settings
- **Themes Report** — AI-generated report that identifies patterns and recurring themes across your audit history
- **DOCX Export** — Download any analysis or themes report as a Word document
- **Global Shortcut** — Toggle TIPPY visibility with `Cmd/Ctrl+Shift+T`
- **System Tray** — Quick access from the menu bar
- **Built-In Accessibility Settings** — 10 configurable options: high contrast, font scaling, color blind modes (protanopia, deuteranopia, tritanopia, achromatopsia), reduced motion, cursor styles, cursor trail, OpenDyslexic font, bionic reading, enhanced text spacing, and enhanced focus indicators
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

## Build from Source

If you prefer to build TIPPY yourself instead of using the [pre-built releases](#download):

```bash
# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux
```

Built artifacts will be in the `dist/` directory. On macOS, copy the app to your Applications folder:

```bash
cp -R "dist/mac-arm64/TIPPY - Accessibility Partner.app" /Applications/
codesign --force --deep --sign - "/Applications/TIPPY - Accessibility Partner.app"
```

## Usage

1. **Launch** — Open TIPPY from your Applications folder, or run `npm run dev` for development
2. **Widget** — TIPPY appears as a floating, draggable icon on your desktop
3. **Open Panel** — Click the TIPPY icon to open the full panel with Chat, History, and Settings
4. **Chat** — Type questions about accessibility or paste content for analysis
5. **URL Scan** — Paste a URL to run an automated accessibility audit
6. **Settings** — Configure your AI provider (Ollama, Anthropic, OpenAI, or Google Gemini)
7. **Upload** — Drag and drop files or click the upload button for document analysis
8. **History** — View past analyses in the History tab; search, filter by type, or organize into folders
9. **Folders** — Click "Folders" in the History toolbar to create folders, then use the folder icon on any item to move it
10. **Themes Report** — Click "Report on Themes" in History to get an AI-generated patterns analysis
11. **Database Location** — In Settings, scroll to "History Database Location" to change where your data is stored
12. **Toggle** — Press `Cmd/Ctrl+Shift+T` to show/hide TIPPY at any time

## Architecture

- **Electron** + **React 18** + **TypeScript**
- **electron-vite** for fast development and building
- **TailwindCSS 4** for styling with design tokens
- **Zustand** for state management
- **better-sqlite3** for local database (audit history + settings)
- **Electron safeStorage** for encrypted API key storage
- **Multi-window architecture** — floating widget + expandable panel

## Project Structure

```
src/
  main/           # Electron main process
    ipc/          # IPC handlers (analysis, chat, settings, history, window)
    services/     # AI providers, analysis engine, prompt builder, storage
    db/           # SQLite database connection and schema
  preload/        # Typed IPC bridge
  renderer/       # React frontend
    components/   # Widget, Chat, Settings, History components
    stores/       # Zustand state stores
    hooks/        # Custom React hooks (streaming, keyboard nav, a11y)
    views/        # Settings, History views
    styles/       # Tailwind + design tokens
data/             # Bundled WCAG 2.1 AA criteria JSON
build/            # App icons and build resources
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

Built with care by Rocco Catrone of [Tech Inclusion Pro, LLC](https://techinclusion.pro)
