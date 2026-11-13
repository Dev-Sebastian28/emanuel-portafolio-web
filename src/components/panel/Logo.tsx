import { Instrument_Serif } from 'next/font/google'

// La misma letra de los títulos de la página, para que el panel se sienta de Emanuel.
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', display: 'swap' })

/** Logo de la pantalla de inicio de sesión. Cuando llegue el logo de Emanuel, se cambia aquí. */
export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
      <span
        className={serif.className}
        aria-hidden="true"
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '3.25rem',
          height: '3.25rem',
          borderRadius: '999px',
          background: 'var(--theme-text)',
          color: 'var(--theme-bg)',
          fontSize: '2.1rem',
          lineHeight: 1,
          paddingBottom: '0.15rem',
        }}
      >
        E
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span className={serif.className} style={{ fontSize: '1.9rem' }}>
          Emanuel Fonseca
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--theme-elevation-500)',
            marginTop: '0.3rem',
          }}
        >
          Panel de contenido
        </span>
      </span>
    </div>
  )
}
