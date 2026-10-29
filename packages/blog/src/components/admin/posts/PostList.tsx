'use client'

import { Badge, Box, Button, Flex, Input, Link, NativeSelect, Stack, Table, Text } from '@chakra-ui/react'
import axios from 'axios'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { ColumnHeader } from '@blog/components/admin/ui/ColumnHeader'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import { postListPageSize } from '@blog/core/validation/post'
import type { AdminPostRow, PostListFilters } from '@blog/db/queries/admin/posts'

import { localeNames, stateLabel } from './postState'

interface PostListProps {
  posts: AdminPostRow[]
  total: number
  filters: PostListFilters
  categories: { id: string; name: string }[]
}

function pageHref(filters: PostListFilters, page: number) {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.locale) params.set('idioma', filters.locale)
  if (filters.status) params.set('estado', filters.status)
  if (filters.categoryId) params.set('categoria', filters.categoryId)
  if (page > 1) params.set('pagina', String(page))
  const query = params.toString()
  return `/admin/entradas/${query ? `?${query}` : ''}`
}

const filterSelect = (name: string, label: string, value: string | undefined, options: [string, string][]) => (
  <NativeSelect.Root size="lg" maxW={{ md: '220px' }}>
    <NativeSelect.Field name={name} defaultValue={value ?? ''} aria-label={label} bg="bg.panel">
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </NativeSelect.Field>
    <NativeSelect.Indicator />
  </NativeSelect.Root>
)

export function PostList({ posts, total, filters, categories }: PostListProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const page = filters.page ?? 1
  const pages = Math.max(1, Math.ceil(total / postListPageSize))
  const filtered = Boolean(filters.query || filters.locale || filters.status || filters.categoryId)

  async function createPost() {
    setCreating(true)
    setError(null)
    try {
      const { data } = await axios.post<{ id: string }>('/api/admin/posts/', { locale: 'es' })
      router.push(`/admin/entradas/${data.id}/es/`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se ha podido crear. Inténtalo de nuevo.'))
      setCreating(false)
    }
  }

  return (
    <Stack gap={6}>
      <AdminPageHeader
        title="Entradas"
        description="Las entradas de la web, en español y en inglés. Las últimas que has tocado salen primero."
        action={
          <Button colorPalette="gold" size="lg" loading={creating} loadingText="Creando…" onClick={createPost}>
            Nueva entrada
          </Button>
        }
      />
      {error && (
        <Box role="alert" bg="red.50" color="red.900" p={4} borderRadius="md">
          {error}
        </Box>
      )}

      <Flex asChild gap={3} wrap="wrap">
        <form role="search" method="get" action="/admin/entradas/">
          <Input
            name="q"
            type="search"
            defaultValue={filters.query}
            placeholder="Buscar por título o número"
            aria-label="Buscar entradas por título o número"
            size="lg"
            bg="bg.panel"
            maxW={{ md: 'sm' }}
          />
          {filterSelect('estado', 'Estado', filters.status, [
            ['', 'Todos los estados'],
            ['published', 'Publicadas'],
            ['draft', 'Borradores'],
            ['scheduled', 'Programadas'],
          ])}
          {filterSelect('idioma', 'Idioma', filters.locale, [
            ['', 'Los dos idiomas'],
            ['es', 'Con versión en español'],
            ['en', 'Con versión en inglés'],
          ])}
          {filterSelect('categoria', 'Categoría', filters.categoryId, [
            ['', 'Todas las categorías'],
            ...categories.map(category => [category.id, category.name] as [string, string]),
          ])}
          <Button type="submit" size="lg" variant="outline" bg="bg.panel">
            Buscar
          </Button>
          {filtered && (
            <Button asChild size="lg" variant="ghost">
              <NextLink href="/admin/entradas/">Quitar filtros</NextLink>
            </Button>
          )}
        </form>
      </Flex>

      <Text color="fg.muted" aria-live="polite">
        {total === 1 ? '1 entrada' : `${total} entradas`}
      </Text>

      {posts.length === 0 ? (
        <Text fontSize="lg">{filtered ? 'Ninguna entrada cumple esos filtros.' : 'Todavía no hay entradas.'}</Text>
      ) : (
        <Table.ScrollArea position="relative" borderWidth={1} borderRadius="lg" bg="bg.panel">
          <Table.Root size="lg">
            <Table.Header>
              <Table.Row>
                <ColumnHeader label="Título" hint="El título de la entrada. Pulsa para editarla." />
                <ColumnHeader
                  label="Idiomas"
                  hint="Cada versión y cómo está: publicada, en borrador o programada para un día."
                />
                <ColumnHeader label="Categorías" hint="La primera es la principal." />
                <ColumnHeader label="Último cambio" hint="La última vez que alguien la tocó en el panel." />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {posts.map(post => (
                <Table.Row key={post.id}>
                  <Table.Cell>
                    <Link asChild fontWeight="bold">
                      <NextLink href={`/admin/entradas/${post.id}/${post.translations[0]!.locale}/`}>
                        {post.title || 'Entrada sin título'}
                      </NextLink>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Stack gap={1} align="flex-start">
                      {post.translations.map(translation => (
                        <Badge key={translation.locale} colorPalette={stateLabel(translation).palette} size="lg">
                          {localeNames[translation.locale]}: {stateLabel(translation).label}
                        </Badge>
                      ))}
                    </Stack>
                  </Table.Cell>
                  <Table.Cell>{post.categories.join(', ') || '—'}</Table.Cell>
                  <Table.Cell whiteSpace="nowrap">
                    {new Date(post.updatedAt).toLocaleDateString('es-ES', {
                      dateStyle: 'medium',
                      timeZone: 'Europe/Madrid',
                    })}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}

      {pages > 1 && (
        <Flex as="nav" aria-label="Páginas" gap={3} align="center" justify="center">
          {page > 1 && (
            <Button asChild variant="outline" bg="bg.panel">
              <NextLink href={pageHref(filters, page - 1)}>← Anteriores</NextLink>
            </Button>
          )}
          <Text>
            Página {page} de {pages}
          </Text>
          {page < pages && (
            <Button asChild variant="outline" bg="bg.panel">
              <NextLink href={pageHref(filters, page + 1)}>Siguientes →</NextLink>
            </Button>
          )}
        </Flex>
      )}
    </Stack>
  )
}
