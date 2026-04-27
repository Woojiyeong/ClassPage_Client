/**
 * 백엔드 API 베이스 URL
 * - 개발: .env 의 VITE_API_URL 또는 기본 http://localhost:3000
 * - 프로덕션(Vercel): VITE_API_URL 이 있으면 그대로, 없으면 `/api/classpage`
 *   (Vercel Serverless 가 CLASSPAGE_API_ORIGIN 으로 실제 API에 프록시)
 * - Docker 스택 빌드: VITE_API_URL=/api (nginx → Nest)
 */
function resolveApiBase() {
  const v = import.meta.env.VITE_API_URL
  if (v != null && String(v).trim() !== '') {
    return String(v).replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }
  return '/api/classpage'
}

export const API_BASE = resolveApiBase()
