'use client'

import NextImage, { ImageProps } from 'next/image'

export type FramedImageProps = Omit<ImageProps, 'fill'> & {
  focus?: ImageFocus
  fit?: ImageFit
}

/**
 * A `fill` image that either crops around its focus point or, with `contain`, shows the whole
 * picture over a blurred copy of itself so the box never has empty bands. Its parent must be
 * positioned and hide its overflow.
 */
export function FramedImage({ focus, fit = 'cover', style, ...props }: FramedImageProps) {
  return (
    <>
      {fit === 'contain' && (
        <NextImage
          {...props}
          alt=""
          aria-hidden
          fill
          style={{ ...style, objectFit: 'cover', filter: 'blur(24px) brightness(0.85)', transform: 'scale(1.15)' }}
        />
      )}
      <NextImage
        {...props}
        fill
        style={{ ...style, objectFit: fit, objectPosition: focus ? `${focus.x}% ${focus.y}%` : undefined }}
      />
    </>
  )
}
