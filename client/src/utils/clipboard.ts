/**
 * Copy text to clipboard with iframe compatibility fallback.
 * 
 * navigator.clipboard.writeText() may fail in iframe environments
 * due to permission restrictions. This utility falls back to the
 * legacy execCommand('copy') method for broader compatibility.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for iframe or restricted environments
  }

  // Fallback: use textarea + execCommand for iframe compatibility
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '-9999px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch {
    return false
  }
}
