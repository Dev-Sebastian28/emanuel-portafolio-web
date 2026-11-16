/** Datos para Google dentro de la página (schema.org en formato JSON-LD). No se ven. */
export function DatosGoogle({ datos }: { datos: object }) {
  return (
    <script
      type="application/ld+json"
      // Se escapa "<" para que ningún texto del panel pueda cerrar la etiqueta.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, '\\u003c') }}
    />
  )
}
