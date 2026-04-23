/** 백엔드 API 베이스 URL (Vite: .env 의 VITE_API_URL) */
export const API_BASE =
  (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
