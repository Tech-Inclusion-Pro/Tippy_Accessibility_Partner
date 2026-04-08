import { useState, useEffect, useCallback, useRef } from 'react'

interface A11ySettings {
  theme: 'light' | 'dark' | 'system'
  highContrast: boolean
  fontSize: number
  colorBlindMode: string
  reducedMotion: boolean
  cursorStyle: string
  cursorTrail: boolean
  dyslexicFont: boolean
  bionicReading: boolean
  textSpacing: boolean
  enhancedFocus: boolean
}

const DEFAULTS: A11ySettings = {
  theme: 'system',
  highContrast: false,
  fontSize: 100,
  colorBlindMode: 'none',
  reducedMotion: false,
  cursorStyle: 'default',
  cursorTrail: false,
  dyslexicFont: false,
  bionicReading: false,
  textSpacing: false,
  enhancedFocus: false
}

const STORAGE_KEY = 'tippy-a11y-settings'

function loadSettings(): A11ySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS }
}

function saveSettings(settings: A11ySettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// ── Bionic reading: bold first half of each word ──
function applyBionicReading(): void {
  removeBionicReading()
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        const tag = parent.tagName
        if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
          return NodeFilter.FILTER_REJECT
        }
        if (parent.closest('.a11y-settings-panel')) return NodeFilter.FILTER_REJECT
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_ACCEPT
      }
    }
  )

  const nodes: Text[] = []
  let current: Node | null
  while ((current = walker.nextNode())) {
    nodes.push(current as Text)
  }

  for (const textNode of nodes) {
    const text = textNode.textContent || ''
    const span = document.createElement('span')
    span.className = 'bionic-wrapper'
    const words = text.split(/(\s+)/)
    for (const word of words) {
      if (/^\s+$/.test(word)) {
        span.appendChild(document.createTextNode(word))
      } else if (word.length > 1) {
        const mid = Math.ceil(word.length * 0.5)
        const bold = document.createElement('b')
        bold.className = 'bionic-bold'
        bold.textContent = word.slice(0, mid)
        span.appendChild(bold)
        span.appendChild(document.createTextNode(word.slice(mid)))
      } else {
        span.appendChild(document.createTextNode(word))
      }
    }
    textNode.parentNode?.replaceChild(span, textNode)
  }
}

function removeBionicReading(): void {
  document.querySelectorAll('.bionic-wrapper').forEach((wrapper) => {
    const text = wrapper.textContent || ''
    wrapper.replaceWith(document.createTextNode(text))
  })
}

// ── Cursor trail ──
let trailCleanup: (() => void) | null = null

function enableCursorTrail(): void {
  disableCursorTrail()
  const handleMove = (e: MouseEvent): void => {
    const dot = document.createElement('div')
    dot.style.cssText = `position:fixed;left:${e.clientX - 4}px;top:${e.clientY - 4}px;width:8px;height:8px;border-radius:50%;background:var(--tippy-purple);pointer-events:none;z-index:99999;opacity:0.7;transition:opacity 0.5s,transform 0.5s;`
    document.body.appendChild(dot)
    requestAnimationFrame(() => {
      dot.style.opacity = '0'
      dot.style.transform = 'scale(0.3)'
    })
    setTimeout(() => dot.remove(), 500)
  }
  window.addEventListener('mousemove', handleMove)
  trailCleanup = () => window.removeEventListener('mousemove', handleMove)
}

function disableCursorTrail(): void {
  trailCleanup?.()
  trailCleanup = null
  document.querySelectorAll('div[style*="border-radius:50%"][style*="z-index:99999"]').forEach((el) => el.remove())
}

// ── Color blind SVG filters ──
function ensureColorBlindFilters(): void {
  if (document.getElementById('a11y-cb-filters')) return
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.id = 'a11y-cb-filters'
  svg.setAttribute('class', 'a11y-colorblind-filter')
  svg.innerHTML = `
    <defs>
      <filter id="a11y-protanopia">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="a11y-deuteranopia">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="a11y-tritanopia">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
      </filter>
    </defs>
  `
  document.body.appendChild(svg)
}

// ── Theme management ──
let systemThemeCleanup: (() => void) | null = null

function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const html = document.documentElement

  // Clean up previous system listener
  systemThemeCleanup?.()
  systemThemeCleanup = null

  if (theme === 'dark') {
    html.classList.add('dark')
  } else if (theme === 'light') {
    html.classList.remove('dark')
  } else {
    // System: match OS preference and listen for changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (e: MediaQueryList | MediaQueryListEvent): void => {
      html.classList.toggle('dark', e.matches)
    }
    apply(mq)
    const handler = (e: MediaQueryListEvent): void => apply(e)
    mq.addEventListener('change', handler)
    systemThemeCleanup = () => mq.removeEventListener('change', handler)
  }
}

// ── Apply all settings to DOM ──
function applyAllSettings(settings: A11ySettings): void {
  const html = document.documentElement

  // Theme
  applyTheme(settings.theme)

  // High contrast
  html.classList.toggle('a11y-high-contrast', settings.highContrast)

  // Font scale
  if (settings.fontSize !== 100) {
    html.classList.add('a11y-font-scaled')
    html.style.setProperty('--a11y-font-scale', String(settings.fontSize / 100))
  } else {
    html.classList.remove('a11y-font-scaled')
    html.style.removeProperty('--a11y-font-scale')
  }

  // Color blind mode
  html.classList.remove('a11y-cb-protanopia', 'a11y-cb-deuteranopia', 'a11y-cb-tritanopia', 'a11y-cb-achromatopsia')
  if (settings.colorBlindMode !== 'none') {
    ensureColorBlindFilters()
    html.classList.add(`a11y-cb-${settings.colorBlindMode}`)
  }

  // Reduced motion
  html.classList.toggle('a11y-reduced-motion', settings.reducedMotion)

  // Cursor style
  html.classList.remove('a11y-cursor-large', 'a11y-cursor-crosshair')
  if (settings.cursorStyle !== 'default') {
    html.classList.add(`a11y-cursor-${settings.cursorStyle}`)
  }

  // Cursor trail
  if (settings.cursorTrail && !settings.reducedMotion) {
    enableCursorTrail()
  } else {
    disableCursorTrail()
  }

  // Dyslexic font
  html.classList.toggle('a11y-dyslexic', settings.dyslexicFont)

  // Text spacing
  html.classList.toggle('a11y-text-spacing', settings.textSpacing)

  // Enhanced focus
  html.classList.toggle('a11y-enhanced-focus', settings.enhancedFocus)

  // Bionic reading
  html.classList.toggle('a11y-bionic', settings.bionicReading)
  if (settings.bionicReading) {
    setTimeout(() => applyBionicReading(), 50)
  } else {
    removeBionicReading()
  }
}

// ── Toggle component ──
function Toggle({
  checked,
  onChange,
  label,
  id
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  id: string
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm text-[var(--text-primary)] cursor-pointer">
        {label}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
          checked ? 'bg-[var(--tippy-purple)]' : 'bg-[var(--bg-active)]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function AccessibilitySettings(): JSX.Element {
  const [settings, setSettings] = useState<A11ySettings>(DEFAULTS)
  const initialized = useRef(false)

  // Load on mount
  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    applyAllSettings(loaded)
    initialized.current = true
  }, [])

  const update = useCallback(
    (patch: Partial<A11ySettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch }
        saveSettings(next)
        applyAllSettings(next)
        return next
      })
    },
    []
  )

  const handleReset = useCallback(() => {
    setSettings({ ...DEFAULTS })
    saveSettings({ ...DEFAULTS })
    applyAllSettings({ ...DEFAULTS })
  }, [])

  return (
    <div className="a11y-settings-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Accessibility</h3>
        <button
          onClick={handleReset}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors px-2 py-1 rounded hover:bg-[var(--bg-hover)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
        >
          Reset All
        </button>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">
        Customize TIPPY's display to match your preferences and needs.
      </p>

      <div className="flex flex-col gap-5">
        {/* ── Theme ── */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            Theme
          </legend>

          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => update({ theme: t })}
                className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)] ${
                  settings.theme === t
                    ? 'border-[var(--tippy-purple)] bg-[var(--tippy-purple)]/10 text-[var(--tippy-purple)]'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
                aria-pressed={settings.theme === t}
                aria-label={`${t.charAt(0).toUpperCase() + t.slice(1)} theme`}
              >
                {t === 'light' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 2V3.5M9 14.5V16M2 9H3.5M14.5 9H16M4.1 4.1L5.2 5.2M12.8 12.8L13.9 13.9M4.1 13.9L5.2 12.8M12.8 5.2L13.9 4.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
                {t === 'dark' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M15 10.5A6.5 6.5 0 0 1 7.5 3 6.5 6.5 0 1 0 15 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {t === 'system' && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="2" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 16H12M9 13V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>

        {/* ── Vision ── */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            Vision
          </legend>

          <Toggle
            id="a11y-high-contrast"
            label="High Contrast"
            checked={settings.highContrast}
            onChange={(v) => update({ highContrast: v })}
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="a11y-font-size" className="text-sm text-[var(--text-primary)]">
                Font Size
              </label>
              <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{settings.fontSize}%</span>
            </div>
            <input
              id="a11y-font-size"
              type="range"
              min={100}
              max={200}
              step={10}
              value={settings.fontSize}
              onChange={(e) => update({ fontSize: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none bg-[var(--bg-active)] accent-[var(--tippy-purple)] cursor-pointer"
              aria-label={`Font size: ${settings.fontSize}%`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="a11y-colorblind" className="text-sm text-[var(--text-primary)]">
              Color Blind Mode
            </label>
            <select
              id="a11y-colorblind"
              value={settings.colorBlindMode}
              onChange={(e) => update({ colorBlindMode: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            >
              <option value="none">None</option>
              <option value="protanopia">Protanopia (Red-Blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
              <option value="tritanopia">Tritanopia (Blue-Blind)</option>
              <option value="achromatopsia">Achromatopsia (Grayscale)</option>
            </select>
          </div>
        </fieldset>

        {/* ── Motion & Cursor ── */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            Motion & Cursor
          </legend>

          <Toggle
            id="a11y-reduced-motion"
            label="Reduced Motion"
            checked={settings.reducedMotion}
            onChange={(v) => {
              const patch: Partial<A11ySettings> = { reducedMotion: v }
              if (v) patch.cursorTrail = false
              update(patch)
            }}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="a11y-cursor" className="text-sm text-[var(--text-primary)]">
              Cursor Style
            </label>
            <select
              id="a11y-cursor"
              value={settings.cursorStyle}
              onChange={(e) => update({ cursorStyle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus-visible:outline-3 focus-visible:outline-[var(--tippy-purple)]"
            >
              <option value="default">Default</option>
              <option value="large">Large</option>
              <option value="crosshair">Crosshair</option>
            </select>
          </div>

          <Toggle
            id="a11y-cursor-trail"
            label="Cursor Trail"
            checked={settings.cursorTrail}
            onChange={(v) => update({ cursorTrail: v })}
          />
          {settings.reducedMotion && settings.cursorTrail && (
            <p className="text-xs text-[var(--color-warning)]">
              Cursor trail is disabled while Reduced Motion is on.
            </p>
          )}
        </fieldset>

        {/* ── Reading ── */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            Reading
          </legend>

          <Toggle
            id="a11y-dyslexic"
            label="OpenDyslexic Font"
            checked={settings.dyslexicFont}
            onChange={(v) => update({ dyslexicFont: v })}
          />

          <Toggle
            id="a11y-bionic"
            label="Bionic Reading"
            checked={settings.bionicReading}
            onChange={(v) => update({ bionicReading: v })}
          />

          <Toggle
            id="a11y-text-spacing"
            label="Enhanced Text Spacing"
            checked={settings.textSpacing}
            onChange={(v) => update({ textSpacing: v })}
          />
        </fieldset>

        {/* ── Focus ── */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
            Focus
          </legend>

          <Toggle
            id="a11y-enhanced-focus"
            label="Enhanced Focus Indicators"
            checked={settings.enhancedFocus}
            onChange={(v) => update({ enhancedFocus: v })}
          />
        </fieldset>
      </div>
    </div>
  )
}
