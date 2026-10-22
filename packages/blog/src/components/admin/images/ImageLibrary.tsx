'use client'

import { Box, Button, Flex, Input, Spinner, Stack, Text, VisuallyHidden } from '@chakra-ui/react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { type DragEvent, type FormEvent, useRef, useState } from 'react'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'

import { ImageGrid } from './ImageGrid'
import { UploadDialog } from './UploadDialog'
import { addToLibrary, fetchLibraryPage, libraryQueryKey, libraryStaleTime } from './images'

const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes('Files')

export function ImageLibrary() {
  const queryClient = useQueryClient()
  const fileInput = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [files, setFiles] = useState<File[] | null>(null)
  const [dragging, setDragging] = useState(false)

  const library = useInfiniteQuery({
    queryKey: libraryQueryKey(query),
    queryFn: ({ pageParam }) => fetchLibraryPage(query, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: page => page.nextCursor,
    staleTime: libraryStaleTime,
  })
  const images = library.data?.pages.flatMap(page => page.images) ?? []
  const total = library.data?.pages[0]?.total

  function onSearch(event: FormEvent) {
    event.preventDefault()
    setQuery(search.trim())
  }

  function chooseFiles(list: FileList | null) {
    if (list?.length) {
      setFiles(Array.from(list))
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    chooseFiles(event.dataTransfer.files)
  }

  return (
    <Stack gap={6}>
      <AdminPageHeader
        title="Imágenes"
        description="Todas las imágenes de la web, guardadas en Cloudinary. Pulsa una para cambiarle el nombre o la descripción, o para borrarla."
        action={
          <Button colorPalette="orange" size="lg" onClick={() => fileInput.current?.click()}>
            Subir imágenes
          </Button>
        }
      />
      <VisuallyHidden asChild>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          aria-label="Elegir imágenes para subir"
          onChange={event => {
            chooseFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </VisuallyHidden>

      <Box
        data-testid="drop-zone"
        borderWidth={2}
        borderStyle="dashed"
        borderColor={dragging ? 'orange.500' : 'gray.400'}
        bg={dragging ? 'orange.50' : 'white'}
        borderRadius="lg"
        p={6}
        textAlign="center"
        onDragOver={event => {
          if (hasFiles(event)) {
            event.preventDefault()
            setDragging(true)
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <Text fontSize="lg">
          {dragging ? 'Suelta las imágenes para subirlas' : 'Arrastra aquí las imágenes que quieras subir o '}
          {!dragging && (
            <Button
              variant="plain"
              textDecoration="underline"
              fontSize="lg"
              p={0}
              h="auto"
              onClick={() => fileInput.current?.click()}
            >
              pulsa para elegirlas
            </Button>
          )}
        </Text>
      </Box>

      <Flex as="form" role="search" onSubmit={onSearch} gap={3} direction={{ base: 'column', sm: 'row' }}>
        <Input
          type="search"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Buscar por nombre"
          aria-label="Buscar imágenes por nombre"
          size="lg"
          bg="white"
          maxW={{ sm: 'md' }}
        />
        <Button type="submit" size="lg" variant="outline" bg="white">
          Buscar
        </Button>
        {query && (
          <Button
            size="lg"
            variant="ghost"
            onClick={() => {
              setSearch('')
              setQuery('')
            }}
          >
            Ver todas
          </Button>
        )}
      </Flex>

      {library.isPending ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" aria-label="Cargando imágenes" />
        </Flex>
      ) : library.isError ? (
        <Box role="alert" bg="red.50" color="red.900" p={4} borderRadius="md">
          {apiErrorMessage(library.error, 'No se han podido cargar las imágenes. Inténtalo de nuevo.')}
        </Box>
      ) : images.length === 0 ? (
        <Text fontSize="lg">
          {query ? `No hay ninguna imagen que se llame «${query}».` : 'Todavía no hay imágenes.'}
        </Text>
      ) : (
        <Stack gap={6}>
          <Text color="fg.muted" aria-live="polite">
            {query ? `${total} ${total === 1 ? 'imagen encontrada' : 'imágenes encontradas'}` : `${total} imágenes`}
          </Text>
          <ImageGrid images={images} />
          {library.hasNextPage && (
            <Button
              alignSelf="center"
              size="lg"
              variant="outline"
              bg="white"
              loading={library.isFetchingNextPage}
              loadingText="Cargando…"
              onClick={() => library.fetchNextPage()}
            >
              Cargar más imágenes
            </Button>
          )}
        </Stack>
      )}

      {files && (
        <UploadDialog
          files={files}
          onUploaded={image => addToLibrary(queryClient, image)}
          onClose={() => setFiles(null)}
        />
      )}
    </Stack>
  )
}
