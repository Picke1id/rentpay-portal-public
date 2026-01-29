import type { ButtonHTMLAttributes } from 'react'

export const Button = ({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`btn ${className}`}
      {...props}
    />
  )
}
