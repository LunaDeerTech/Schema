/**
 * LaTeX公式解析和转换工具
 * 用于将Markdown中的LaTeX公式转换为Tiptap编辑器支持的格式
 */

/**
 * 处理Markdown内容中的LaTeX公式
 * @param content Markdown内容
 * @returns 处理后的内容，LaTeX公式被转换为HTML格式
 */
export function processLatexInMarkdown(content: string): string {
  // 处理块级公式 $$...$$
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_match, latex) => {
    // 转义HTML特殊字符
    const escapedLatex = escapeHtml(latex.trim())
    return `<div data-math-block="" data-latex="${escapedLatex}"></div>`
  })
  
  // 处理行内公式 $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_match, latex) => {
    // 转义HTML特殊字符
    const escapedLatex = escapeHtml(latex.trim())
    return `<span data-math-inline="" data-latex="${escapedLatex}"></span>`
  })
  
  return processed
}

/**
 * 转义HTML特殊字符
 * @param text 需要转义的文本
 * @returns 转义后的文本
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 检查内容是否包含LaTeX公式
 * @param content 内容
 * @returns 是否包含LaTeX公式
 */
export function containsLatex(content: string): boolean {
  return /\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$/.test(content)
}