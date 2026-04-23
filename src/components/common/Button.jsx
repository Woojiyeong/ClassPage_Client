export default function Button({
  variant = 'primary',
  size,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'ghost' && 'btn-ghost',
    variant === 'danger' && 'btn-danger',
    size === 'sm' && 'btn-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
