import { API_BASE } from '../config.js'

const TOKEN_KEY = 'classpage.access_token'

export function getStoredToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  if (typeof window === 'undefined') return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: unknown, token?: string | null, raw?: boolean }} [opts]
 */
export async function apiFetch(path, opts = {}) {
  const { method = 'GET', body, raw } = opts
  const explicitToken = Object.prototype.hasOwnProperty.call(opts, 'token')
  const t = explicitToken ? opts.token : getStoredToken()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (t != null && String(t).length > 0) {
    headers.Authorization = `Bearer ${t}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  if (raw) {
    if (!res.ok) {
      const err = new Error(text || res.statusText)
      err.status = res.status
      throw err
    }
    return text
  }

  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = text
    }
  }

  if (!res.ok) {
    const msg = json?.message ?? text ?? res.statusText
    const err = new Error(
      typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(', ') : JSON.stringify(msg),
    )
    err.status = res.status
    err.body = json
    throw err
  }
  return json
}
