// En celular no cabe todo: "Sobre mí" se oculta (queda justo entre Trabajos y Contacto al bajar).
const ENLACES = [
  { href: '#trabajos', texto: 'Trabajos', clase: '' },
  { href: '#sobre-mi', texto: 'Sobre mí', clase: 'hidden sm:inline' },
  { href: '#contacto', texto: 'Contacto', clase: '' },
]

export function Encabezado({ nombre }: { nombre: string }) {
  return (
    <header className="bg-fondo/85 border-linea fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md">
      <nav
        aria-label="Principal"
        className="sin-barra mx-auto flex h-16 items-center gap-5 overflow-x-auto px-5 whitespace-nowrap sm:gap-6 md:px-10"
      >
        <a href="#inicio" className="font-display mr-auto text-xl leading-none sm:text-2xl">
          {nombre}
        </a>
        {ENLACES.map((enlace) => (
          <a
            key={enlace.href}
            href={enlace.href}
            className={`text-gris hover:text-tinta text-sm transition-colors ${enlace.clase}`}
          >
            {enlace.texto}
          </a>
        ))}
      </nav>
    </header>
  )
}
