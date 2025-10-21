import { memo, useState, useMemo } from 'react'

import { type ImageData } from '@/types/playground'
import { cn } from '@/lib/utils'

/**
 * Componente seguro para exibir fallback quando a imagem falha ao carregar
 * Sanitiza URLs para prevenir XSS via javascript: ou data: protocols
 */
const ImageErrorFallback = ({ url }: { url: string }) => {
  const sanitizedUrl = useMemo(() => {
    try {
      const urlObj = new URL(url)
      // Apenas permitir http/https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '#'
      }
      return url
    } catch {
      // URL inválida, retornar fallback seguro
      return '#'
    }
  }, [url])

  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md bg-secondary/50 text-muted">
      <p className="text-primary">Image unavailable</p>
      <a
        href={sanitizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-md truncate p-2 text-center text-xs text-primary underline"
      >
        {url}
      </a>
    </div>
  )
}

const ImageItem = ({ image }: { image: ImageData }) => {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <ImageErrorFallback url={image.url} />
  }

  return (
    <div className="group relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.revised_prompt || 'AI generated image'}
        className="w-full rounded-lg"
        loading="lazy" // Lazy load imagens fora da viewport
        decoding="async" // Decodificação assíncrona para melhor performance
        onError={() => setHasError(true)}
      />
    </div>
  )
}

const Images = ({ images }: { images: ImageData[] }) => (
  <div
    className={cn(
      'grid max-w-xl gap-4',
      images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
    )}
  >
    {images.map((image) => (
      <ImageItem key={image.url} image={image} />
    ))}
  </div>
)

export default memo(Images)

Images.displayName = 'Images'
