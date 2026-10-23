'use client'

import { Box, Button, Field, Flex, Image, Input, Stack, Text } from '@chakra-ui/react'

import type { PostFields } from '@blog/db/queries/admin/posts'

import { thumbnailUrl } from '../../images/images'

interface CoverFieldProps {
  cover: PostFields['cover']
  onChoose: () => void
  onChange: (cover: PostFields['cover']) => void
}

/** The post's main image: chosen from the library, with its own description. */
export function CoverField({ cover, onChoose, onChange }: CoverFieldProps) {
  return (
    <Stack gap={3}>
      <Text fontSize="lg" fontWeight="medium">
        Portada
      </Text>
      {cover ? (
        <Flex gap={4} direction={{ base: 'column', md: 'row' }} align={{ md: 'flex-start' }}>
          <Box
            w={{ base: 'full', md: '240px' }}
            aspectRatio={4 / 3}
            flexShrink={0}
            bg="gray.100"
            borderRadius="md"
            overflow="hidden"
          >
            <Image src={thumbnailUrl(cover.publicId)} alt={cover.alt ?? ''} width="100%" height="100%" fit="contain" />
          </Box>
          <Stack gap={3} flex={1}>
            <Field.Root>
              <Field.Label>Descripción de la portada</Field.Label>
              <Input
                value={cover.alt ?? ''}
                onChange={event => onChange({ ...cover, alt: event.target.value })}
                placeholder="Qué se ve en la imagen"
              />
            </Field.Root>
            <Flex gap={3} wrap="wrap">
              <Button variant="outline" onClick={onChoose}>
                Cambiar la portada
              </Button>
              <Button variant="ghost" colorPalette="red" onClick={() => onChange(null)}>
                Quitar la portada
              </Button>
            </Flex>
          </Stack>
        </Flex>
      ) : (
        <Flex gap={4} align="center" wrap="wrap" borderWidth={2} borderStyle="dashed" borderRadius="md" p={4}>
          <Text>Sin portada. Las entradas sin portada se ven peor en las listas de la web.</Text>
          <Button variant="outline" onClick={onChoose}>
            Elegir la portada
          </Button>
        </Flex>
      )}
    </Stack>
  )
}
