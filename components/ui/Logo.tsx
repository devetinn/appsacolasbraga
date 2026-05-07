interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'mark' | 'full'
  inverted?: boolean
}

const MARK_SIZES = {
  xs: 'w-7 h-7 text-[11px] rounded-xl',
  sm: 'w-9 h-9 text-sm rounded-xl',
  md: 'w-11 h-11 text-base rounded-2xl',
  lg: 'w-16 h-16 text-xl rounded-3xl',
}

const TEXT_SIZES = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
}

export function Logo({ size = 'md', variant = 'full', inverted = false }: LogoProps) {
  const Mark = () => (
    <div className={`${MARK_SIZES[size]} bg-brand-blue flex items-center justify-center shrink-0 shadow-sm`}>
      <span className="font-display font-bold text-white leading-none tracking-tight">SB</span>
    </div>
  )

  if (variant === 'mark') return <Mark />

  return (
    <div className="flex items-center gap-2.5">
      <Mark />
      <span
        className={`font-display font-bold leading-tight ${TEXT_SIZES[size]} ${
          inverted ? 'text-white' : 'text-brand-dark'
        }`}
      >
        Sacolas Braga
      </span>
    </div>
  )
}
