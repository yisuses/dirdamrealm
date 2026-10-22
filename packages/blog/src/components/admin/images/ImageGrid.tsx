'use client'

import { Badge, Box, Grid, Image, LinkBox, LinkOverlay, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'

import { thumbnailUrl } from './images'

/** Each image as a card that opens its page, where it is renamed, described or deleted. */
export function ImageGrid({ images }: { images: LibraryImage[] }) {
  return (
    <Grid as="ul" listStyleType="none" templateColumns="repeat(auto-fill, minmax(160px, 1fr))" gap={4}>
      {images.map(image => (
        <LinkBox
          as="li"
          key={image.publicId}
          bg="white"
          borderWidth={1}
          borderRadius="lg"
          overflow="hidden"
          _hover={{ borderColor: 'orange.500', shadow: 'md' }}
          _focusWithin={{ outline: '3px solid', outlineColor: 'orange.500', outlineOffset: '2px' }}
        >
          <Box bg="gray.100" aspectRatio={4 / 3}>
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
            <LinkOverlay asChild fontWeight="bold" lineClamp={2} wordBreak="break-word">
              <NextLink href={`/admin/imagenes/${image.publicId}/`}>{image.name}</NextLink>
            </LinkOverlay>
            <Text fontSize="sm" color="fg.muted">
              {image.width} × {image.height}
            </Text>
            {!image.alt && (
              <Badge colorPalette="orange" alignSelf="flex-start">
                Sin descripción
              </Badge>
            )}
          </Stack>
        </LinkBox>
      ))}
    </Grid>
  )
}
