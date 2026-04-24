/**
 * 백엔드 API 베이스 URL
 * - 로컬: .env 의 VITE_API_URL 또는 기본 http://localhost:3000
 * - Docker 스택 빌드: VITE_API_URL=/api (nginx가 같은 호스트의 /api 로 Nest에 프록시)
 */
const raw =
  import.meta.env.VITE_API_URL != null && import.meta.env.VITE_API_URL !== ''
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3000'
export const API_BASE = String(raw).replace(/\/$/, '')
