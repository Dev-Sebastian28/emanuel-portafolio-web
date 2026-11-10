import type { SitioVista } from '@/lib/vista'

const boton =
  'inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm transition-colors border'

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
              Instagram <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
