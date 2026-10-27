'use client'

import { Box, Button, Checkbox, Field, Flex, Image, Input, Stack, Text } from '@chakra-ui/react'
import type { KeyboardEvent, MouseEvent } from 'react'

import { FramedImage } from '@blog/components/common/FramedImage'
import type { PostFields } from '@blog/db/queries/admin/posts'

import { previewUrl, thumbnailUrl } from '../../images/images'

type Cover = NonNullable<PostFields['cover']>

interface CoverFieldProps {
  cover: PostFields['cover']
  onChoose: () => void
  onChange: (cover: PostFields['cover']) => void
}

// The boxes the cover fills on the site: the post's header on a computer and on a phone, and
// the post's card in the lists.
const FRAMES = [
  { label: 'En el ordenador', aspectRatio: 12 / 5 },
  { label: 'En el móvil', aspectRatio: 10 / 9 },
  { label: 'En las listas', aspectRatio: 1 },
]

const arrowSteps: Record<string, [number, number]> = {
  ArrowLeft: [-5, 0],
  ArrowRight: [5, 0],
  ArrowUp: [0, -5],
  ArrowDown: [0, 5],
}

const clamp = (value: number) => Math.round(Math.min(100, Math.max(0, value)))

/** Lets the writer mark the part of the cover that must never be cropped out. */
function FocusPicker({ cover, onChange }: { cover: Cover; onChange: (cover: Cover) => void }) {
  const focus = cover.focus ?? { x: 50, y: 50 }

  function pick(event: MouseEvent<HTMLImageElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    onChange({
      ...cover,
      focus: {
        x: clamp(((event.clientX - box.left) / box.width) * 100),
        y: clamp(((event.clientY - box.top) / box.height) * 100),
      },
    })
  }

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const step = arrowSteps[event.key]
    if (step) {
      event.preventDefault()
      onChange({ ...cover, focus: { x: clamp(focus.x + step[0]), y: clamp(focus.y + step[1]) } })
    }
  }

  return (
    <Box
      position="relative"
      display="inline-block"
      alignSelf="flex-start"
      lineHeight={0}
      cursor="crosshair"
      tabIndex={0}
      role="group"
      aria-label="Parte más importante de la portada. Pulsa sobre la foto o usa las flechas para moverla."
      onKeyDown={move}
      borderRadius="md"
      overflow="hidden"
      _focusVisible={{ outline: '2px solid', outlineColor: 'blue.500', outlineOffset: '2px' }}
    >
      <Image
        src={thumbnailUrl(cover.publicId)}
        alt={cover.alt ?? ''}
        maxW="100%"
        maxH="240px"
        onClick={pick}
        draggable={false}
      />
      <Box
        data-testid="cover-focus"
        position="absolute"
        left={`${focus.x}%`}
        top={`${focus.y}%`}
        w="24px"
        h="24px"
        transform="translate(-50%, -50%)"
        borderRadius="full"
        border="3px solid white"
        boxShadow="0 0 0 2px black, 0 2px 8px #0008"
        pointerEvents="none"
      />
    </Box>
  )
}

/** The post's main image: chosen from the library, with its own description and framing. */
export function CoverField({ cover, onChoose, onChange }: CoverFieldProps) {
  return (
    <Stack gap={3}>
      <Text fontSize="lg" fontWeight="medium">
        Portada
      </Text>
      {cover ? (
        <Stack gap={5}>
          <Flex gap={4} direction={{ base: 'column', md: 'row' }} align={{ md: 'flex-start' }}>
            <Stack gap={2} flexShrink={0} maxW={{ md: '320px' }}>
              <FocusPicker cover={cover} onChange={onChange} />
              <Text fontSize="sm" color="fg.muted">
                Pulsa sobre la parte más importante de la foto (una cara, un edificio…). Al recortarla, la web siempre
                la mantendrá a la vista.
              </Text>
            </Stack>
            <Stack gap={3} flex={1}>
              <Field.Root>
                <Field.Label>Descripción de la portada</Field.Label>
                <Input
                  value={cover.alt ?? ''}
                  onChange={event => onChange({ ...cover, alt: event.target.value })}
                  placeholder="Qué se ve en la imagen"
                />
              </Field.Root>
              <Checkbox.Root
                checked={cover.fit === 'contain'}
                onCheckedChange={({ checked }) => onChange({ ...cover, fit: checked === true ? 'contain' : 'cover' })}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Mostrar la foto entera, sin recortar</Checkbox.Label>
              </Checkbox.Root>
              <Flex gap={3} wrap="wrap">
                <Button variant="outline" onClick={onChoose}>
                  Cambiar la portada
                </Button>
                {cover.focus && (
                  <Button variant="ghost" onClick={() => onChange({ ...cover, focus: undefined })}>
                    Volver a centrar
                  </Button>
                )}
                <Button variant="ghost" colorPalette="red" onClick={() => onChange(null)}>
                  Quitar la portada
                </Button>
              </Flex>
            </Stack>
          </Flex>
          <Stack gap={2}>
            <Text fontWeight="medium">Así se verá en la web</Text>
            {/* Each frame grows by its aspect ratio, so side by side they share one height. */}
            <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
              {FRAMES.map(({ label, aspectRatio }) => (
                <Stack key={label} gap={1} flex={{ md: aspectRatio }} minW={0}>
                  <Box position="relative" aspectRatio={aspectRatio} overflow="hidden" borderRadius="md" bg="gray.100">
                    <FramedImage
                      src={previewUrl(cover.publicId)}
                      alt={`Vista previa de la portada ${label.toLowerCase()}`}
                      focus={cover.focus}
                      fit={cover.fit}
                      sizes="320px"
                      unoptimized
                    />
                  </Box>
                  <Text fontSize="sm" color="fg.muted">
                    {label}
                  </Text>
                </Stack>
              ))}
            </Flex>
          </Stack>
        </Stack>
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
