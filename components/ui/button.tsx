import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-sans font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        variant === 'default'     && 'bg-brand-blue text-white hover:bg-brand-blue/90 focus:ring-brand-blue/40',
        variant === 'outline'     && 'border border-black/10 bg-white text-brand-dark hover:bg-brand-cream focus:ring-brand-blue/30',
        variant === 'ghost'       && 'text-brand-dark/60 hover:bg-black/5 focus:ring-brand-dark/20',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3.5 text-base',
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button }
