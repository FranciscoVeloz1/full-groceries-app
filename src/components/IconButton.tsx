import type { ReactNode } from 'react'
import styles from './IconButton.module.css'

type IconButtonProps = {
  label: string
  onClick: () => void
  children: ReactNode
  tone?: 'default' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function IconButton({
  label,
  onClick,
  children,
  tone = 'default',
  disabled = false,
  type = 'button',
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`${styles.button} ${tone === 'danger' ? styles.danger : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
