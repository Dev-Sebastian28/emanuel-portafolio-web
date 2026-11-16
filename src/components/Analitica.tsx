import Script from 'next/script'

/**
 * Google Analytics. Solo se carga si NEXT_PUBLIC_GA_ID tiene el código de la propiedad
 * (empieza por "G-"); en el computador va vacío y no se mide nada.
 */
export function Analitica() {
  const id = process.env.NEXT_PUBLIC_GA_ID
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  )
}
