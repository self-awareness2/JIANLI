/**
 * Check if a string contains HTML tags
 */
export function isHTML(str) {
  return /<[a-z][\s\S]*>/i.test(str)
}

/**
 * Convert plain text description (with "- " bullets and \n) to HTML
 * If already HTML, return as-is
 */
export function descriptionToHTML(text) {
  if (!text) return ''
  if (isHTML(text)) return text

  const lines = text.split('\n').filter(l => l.trim())
  const bullets = []
  const regular = []
  let inBullets = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^[-•·]\s/.test(trimmed)) {
      if (!inBullets && regular.length > 0) {
        // flush regular lines
      }
      inBullets = true
      bullets.push(trimmed.replace(/^[-•·]\s*/, ''))
    } else {
      if (inBullets && bullets.length > 0) {
        regular.push(`<ul>${bullets.map(b => `<li>${b}</li>`).join('')}</ul>`)
        bullets.length = 0
        inBullets = false
      }
      regular.push(`<p>${trimmed}</p>`)
    }
  }

  if (bullets.length > 0) {
    regular.push(`<ul>${bullets.map(b => `<li>${b}</li>`).join('')}</ul>`)
  }

  return regular.join('')
}
