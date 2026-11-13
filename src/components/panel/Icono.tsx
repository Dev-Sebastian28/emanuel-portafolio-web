import { Instrument_Serif } from 'next/font/google'

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', display: 'swap' })

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
