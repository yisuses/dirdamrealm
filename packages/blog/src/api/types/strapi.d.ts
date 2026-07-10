// Strapi v5 returns flattened entities: content fields live directly on the object
// alongside a numeric `id` and a stable string `documentId`. Related entities are
// inlined (a nested object, or an array of them) instead of the v4
// `{ data: { id, attributes } }` envelope.
type StrapiEntity<T> = T & {
  id: number
  // Optional so test fixtures need not carry it; real v5 payloads always include it.
  documentId?: string
}

// Back-compat aliases so the entity *.d.ts definitions read the same as before;
// in v5 they all resolve to the inline (flattened) shape.
type StrapiDataItem<T> = StrapiEntity<T>
type StrapiData<T> = StrapiEntity<T> | null
type StrapiMultipleData<T> = StrapiEntity<T>[]

type StrapiMeta = {
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

type StrapiResponse<T> = { data: StrapiEntity<T>[] } & StrapiMeta
type StrapiSingleResponse<T> = { data: StrapiEntity<T> | null } & StrapiMeta
