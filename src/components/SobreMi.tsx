import { Imagen } from '@/components/Imagen'
import { Marcador } from '@/components/Marcador'
import type { SitioVista } from '@/lib/vista'

export function SobreMi({ sitio }: { sitio: SitioVista }) {
  return (
    <section
      id="sobre-mi"
      className="border-linea grid gap-12 border-t px-5 py-24 md:grid-cols-12 md:gap-8 md:px-10 md:py-36"
    >
      <div data-aparecer className="md:col-span-5">
        <div className="bg-suave relative aspect-[4/5] overflow-hidden rounded-[4px]">
          {sitio.retrato ? (
            <Imagen
              imagen={sitio.retrato}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Marcador texto="Retrato" detalle="Foto de Emanuel pendiente" />
          )}
        </div>
      </div>

      <div data-aparecer className="self-center md:col-span-6 md:col-start-7">
        <p className="etiqueta">Sobre mí</p>
        {sitio.tituloSobreMi && (
          <h2 className="font-display mt-4 text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95]">
            {sitio.tituloSobreMi}
          </h2>
        )}
        {sitio.sobreMi && (
          <p className="text-tinta/80 mt-8 max-w-[58ch] text-lg leading-relaxed whitespace-pre-line">
            {sitio.sobreMi}
          </p>
        )}
        {sitio.etiquetas.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2">
            {sitio.etiquetas.map((etiqueta) => (
              <li key={etiqueta} className="border-linea rounded-full border px-4 py-1.5 text-sm">
                {etiqueta}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
