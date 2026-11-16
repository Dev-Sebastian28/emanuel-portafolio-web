import localFont from 'next/font/local'

const serif = localFont({
  src: '../../fonts/InstrumentSerif-Regular.ttf',
  weight: '400',
  display: 'swap',
})

/** Ícono pequeño del menú del panel: la "E" del diseño. */
export function Icono() {
  return (
    <span
      className={serif.className}
      aria-label="Emanuel Fonseca"
      style={{
        display: 'grid',
        placeItems: 'center',
        width: '1.9rem',
        height: '1.9rem',
        borderRadius: '999px',
        background: 'var(--theme-text)',
        color: 'var(--theme-bg)',
        fontSize: '1.3rem',
        lineHeight: 1,
        paddingBottom: '0.1rem',
      }}
    >
      E
    </span>
  )
}
