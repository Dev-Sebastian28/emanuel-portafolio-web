type Props = {
  texto: string
  detalle?: string
}

/** Espacio reservado mientras el cliente no haya subido la foto o el video. */
export function Marcador({ texto, detalle }: Props) {
  return (
    <div className="bg-suave absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
      <span className="font-display text-tinta/20 text-[clamp(2rem,5vw,4.5rem)] leading-none">
        {texto}
      </span>
      {detalle && <span className="text-gris/80 max-w-[28ch] text-xs">{detalle}</span>}
    </div>
  )
}
