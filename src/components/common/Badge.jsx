export default function Badge({ tone = 'default', children }) {
  const toneClass =
    tone === 'primary'
      ? 'badge-primary'
      : tone === 'warning'
      ? 'badge-warning'
      : tone === 'danger'
      ? 'badge-danger'
      : tone === 'success'
      ? 'badge-success'
      : ''
  return <span className={`badge ${toneClass}`}>{children}</span>
}
