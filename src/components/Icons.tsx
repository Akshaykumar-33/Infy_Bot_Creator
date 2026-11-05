import type { ReactNode } from 'react'

type IconProps = {
  name: IconName
  className?: string
  size?: number
  title?: string
}

export type IconName =
  | 'bot'
  | 'bots'
  | 'add'
  | 'export'
  | 'import'
  | 'extract'
  | 'clear'
  | 'link'
  | 'next'
  | 'loop'
  | 'shared'
  | 'md'
  | 'json'
  | 'txt'
  | 'pack'
  | 'delete'
  | 'steps'
  | 'function'
  | 'close'
  | 'spark'
  | 'download'
  | 'workflow'
  | 'up'
  | 'down'

const paths: Record<IconName, ReactNode> = {
  bot: (
    <>
      <rect x="5" y="8" width="14" height="10" rx="3" />
      <circle cx="9.5" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 3v3M8 5.5 9.5 7M16 5.5 14.5 7" />
      <path d="M8 18v2M16 18v2" />
    </>
  ),
  bots: (
    <>
      <rect x="3.5" y="7" width="8" height="7" rx="2" />
      <rect x="12.5" y="10" width="8" height="7" rx="2" />
      <circle cx="6.5" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M7.5 4.5v2.5M16.5 7.5V10" />
    </>
  ),
  add: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  export: (
    <>
      <path d="M12 4v10" />
      <path d="m8 8 4-4 4 4" />
      <path d="M6 16v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
    </>
  ),
  import: (
    <>
      <path d="M12 14V4" />
      <path d="m8 10 4 4 4-4" />
      <path d="M6 16v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
    </>
  ),
  extract: (
    <>
      <path d="M8 4h6l4 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M14 4v4h4" />
      <path d="M9 14h6M9 17h4" />
    </>
  ),
  clear: (
    <>
      <path d="M5 8h14" />
      <path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="m7 8 1 11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-11" />
      <path d="M10 12v4M14 12v4" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 1 0-6l1.5-1.5a4 4 0 0 1 5.7 5.7L16 13.5" />
      <path d="M14 10a4 4 0 0 1 0 6L12.5 17.5a4 4 0 1 1-5.7-5.7L8 10.5" />
    </>
  ),
  next: (
    <>
      <path d="M5 12h12" />
      <path d="m13 7 5 5-5 5" />
    </>
  ),
  loop: (
    <>
      <path d="M18 11a6 6 0 1 0-1.8 4.3" />
      <path d="M18 7v4h-4" />
    </>
  ),
  shared: (
    <>
      <circle cx="7" cy="8" r="2.2" />
      <circle cx="17" cy="8" r="2.2" />
      <circle cx="12" cy="16" r="2.2" />
      <path d="m8.8 9.4 2.4 4.2M15.2 9.4l-2.4 4.2M9.2 8h5.6" />
    </>
  ),
  md: (
    <>
      <path d="M6 5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 15V9l2.2 3.2L12.5 9v6M14.5 12h2M15.5 9v6" />
    </>
  ),
  json: (
    <>
      <path d="M8 6c-1.8 0-2.5 1-2.5 2.5v1.5c0 .9-.7 1.5-1.5 1.5.8 0 1.5.6 1.5 1.5v1.5C5.5 16 6.2 17 8 17" />
      <path d="M16 6c1.8 0 2.5 1 2.5 2.5v1.5c0 .9.7 1.5 1.5 1.5-.8 0-1.5.6-1.5 1.5v1.5c0 1.5-.7 2.5-2.5 2.5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  txt: (
    <>
      <path d="M7 4h10v16H7z" />
      <path d="M9.5 9h5M12 9v6M9.5 15h5" />
    </>
  ),
  pack: (
    <>
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" />
      <path d="M12 12v8M4 8.5l8 3.5 8-3.5" />
    </>
  ),
  delete: (
    <>
      <path d="M5 8h14" />
      <path d="M9.5 8V6.5A1.5 1.5 0 0 1 11 5h2a1.5 1.5 0 0 1 1.5 1.5V8" />
      <path d="m7.5 8 .8 10.2A1.5 1.5 0 0 0 9.8 19.5h4.4a1.5 1.5 0 0 0 1.5-1.3L16.5 8" />
    </>
  ),
  steps: (
    <>
      <path d="M7 7h11M7 12h11M7 17h8" />
      <circle cx="4.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="17" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  function: (
    <>
      <path d="M8 5c2.5 0 3.5 1.5 3.5 4v6c0 2.5 1 4 3.5 4" />
      <path d="M7 12h8" />
    </>
  ),
  close: <path d="m7 7 10 10M17 7 7 17" />,
  spark: (
    <path
      d="m12 3 1.4 5.1L18.5 9.5 13.4 11 12 16.2 10.6 11 5.5 9.5l5.1-1.4Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 18h14" />
    </>
  ),
  workflow: (
    <>
      <rect x="3" y="4" width="6" height="5" rx="1.5" />
      <rect x="15" y="9.5" width="6" height="5" rx="1.5" />
      <rect x="3" y="15" width="6" height="5" rx="1.5" />
      <path d="M9 6.5h3.5a3 3 0 0 1 3 3V12M9 17.5h3.5a3 3 0 0 0 3-3V14.5" />
    </>
  ),
  up: <path d="m7 14 5-5 5 5" />,
  down: <path d="m7 10 5 5 5-5" />,
}

export function Icon({ name, className = '', size = 18, title }: IconProps) {
  return (
    <svg
      className={`icon icon--${name}${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  )
}
