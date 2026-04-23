export const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10MB

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export const readPdfAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (file.type !== 'application/pdf') {
      reject(new Error('PDF 파일만 업로드할 수 있습니다.'))
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      reject(new Error(`파일 용량이 너무 큽니다. (${formatBytes(MAX_PDF_BYTES)} 이하)`))
      return
    }
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        name: file.name,
        size: file.size,
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString(),
      })
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'))
    reader.readAsDataURL(file)
  })
