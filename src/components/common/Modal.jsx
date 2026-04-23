import { useEffect } from 'react'
import Icon from './Icon.jsx'

export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button
            type="button"
            className="modal-close"
            aria-label="닫기"
            onClick={onClose}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
