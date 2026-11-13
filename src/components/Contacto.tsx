import type { SitioVista } from '@/lib/vista'

const boton =
  'inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm transition-colors border'

function IconoInstagram() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Contacto({ sitio }: { sitio: SitioVista }) {
  const mensaje = encodeURIComponent(
    `Hola, ${sitio.nombre.split(' ')[0]}. Quiero información para un video.`,
  )

  return (
    <section
      id="contacto"
      className="border-linea border-t px-5 py-28 text-center md:px-10 md:py-40"
    >
      <div data-aparecer>
        <p className="etiqueta">Contacto</p>
        <h2 className="font-display mt-6 text-[clamp(3.25rem,11vw,10rem)] leading-[0.88] tracking-[-0.02em]">
          Trabajemos <span className="italic">juntos</span>
        </h2>
        {sitio.textoContacto && (
          <p className="text-gris mx-auto mt-8 max-w-md text-lg">{sitio.textoContacto}</p>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {sitio.whatsapp && (
            <a
              href={`https://wa.me/${sitio.whatsapp}?text=${mensaje}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${boton} bg-tinta text-fondo border-tinta hover:bg-fondo hover:text-tinta`}
            >
              Escribir por WhatsApp <span aria-hidden="true">↗</span>
            </a>
          )}
          {sitio.email && (
            <a
              href={`mailto:${sitio.email}`}
              className={`${boton} ${
                sitio.whatsapp
                  ? 'border-linea hover:border-tinta'
                  : 'bg-tinta text-fondo border-tinta hover:bg-fondo hover:text-tinta'
              }`}
            >
              {sitio.email}
            </a>
          )}
          {sitio.instagram && (
            <a
              href={sitio.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={`${boton} border-linea hover:border-tinta`}
            >
              <IconoInstagram /> Instagram
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
