import type { SitioVista } from '@/lib/vista'

export function Pie({ sitio }: { sitio: SitioVista }) {
  return (
    <footer className="border-linea text-gris flex flex-col justify-between gap-2 border-t px-5 py-8 text-sm sm:flex-row md:px-10">
      <p>
        © {new Date().getFullYear()} {sitio.nombre}
      </p>
      {sitio.ciudad && <p>{sitio.ciudad}</p>}
    </footer>
  )
}
