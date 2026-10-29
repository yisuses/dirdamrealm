'use client'

import { Badge, Box, Grid, Image, LinkBox, LinkOverlay, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'

import { thumbnailUrl } from './images'

interface ImageGridProps {
  images: LibraryImage[]
  /** Choosing mode: each card picks its image instead of opening its page. */
  onSelect?: (image: LibraryImage) => void
}

/** Each image as a card that opens its page, where it is renamed, described or deleted. */
export function ImageGrid({ images, onSelect }: ImageGridProps) {
  return (
    <Grid as="ul" listStyleType="none" templateColumns="repeat(auto-fill, minmax(160px, 1fr))" gap={4}>
      {images.map(image => (
        <LinkBox
          as="li"
          key={image.publicId}
          bg="bg.panel"
          borderWidth={1}
          borderRadius="lg"
          overflow="hidden"
          _hover={{ borderColor: 'accent', shadow: 'md' }}
          _focusWithin={{ outline: '3px solid', outlineColor: 'accent', outlineOffset: '2px' }}
        >
          <Box bg="bg.muted" aspectRatio={4 / 3}>
            <Image
              src={thumbnailUrl(image.publicId)}
              alt={image.alt}
              loading="lazy"
              width="100%"
              height="100%"
              fit="contain"
            />
          </Box>
          <Stack gap={1} p={3}>
            <LinkOverlay asChild fontWeight="bold" lineClamp={2} wordBreak="break-word" textAlign="start">
              {onSelect ? (
                <button type="button" onClick={() => onSelect(image)} aria-label={`Elegir ${image.name}`}>
                  {image.name}
                </button>
              ) : (
                <NextLink href={`/admin/imagenes/${image.publicId}/`}>{image.name}</NextLink>
              )}
            </LinkOverlay>
            <Text fontSize="sm" color="fg.muted">
              {image.width} × {image.height}
            </Text>
            {!image.alt && (
              <Badge colorPalette="gold" alignSelf="flex-start">
                Sin descripción
              </Badge>
            )}
          </Stack>
        </LinkBox>
      ))}
    </Grid>
  )
}
