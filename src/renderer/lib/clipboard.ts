export async function copyToClipboard(text: string): Promise<void> {
  if (window.api) {
    await window.api.writeClipboard(text)
  } else {
    await navigator.clipboard.writeText(text)
  }
}
