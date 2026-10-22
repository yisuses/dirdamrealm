import { asc } from 'drizzle-orm'

import { type ContactInput, socialNetworks } from '@blog/core/validation/contact'

import { getDb } from '../../client'
import { siteContact, socialLinks } from '../../schema'

type Network = (typeof socialNetworks)[number]

const isKnownNetwork = (network: string): network is Network => (socialNetworks as readonly string[]).includes(network)

/** The contact block and social links, ready for the form; defaults before the first save. */
export async function getContactForAdmin(): Promise<ContactInput> {
  const db = getDb()
  const [contact] = await db.select().from(siteContact)
  const links = await db.select().from(socialLinks).orderBy(asc(socialLinks.position))
  return {
    display: contact?.display ?? true,
    name: contact?.name ?? '',
    email: contact?.email ?? '',
    socialLinks: links
      .filter(link => isKnownNetwork(link.network))
      .map(link => ({
        network: link.network as Network,
        handle: link.handle ?? '',
        url: link.url,
        visible: link.visible,
      })),
  }
}

/** Saves the whole block at once: the links are replaced in the order the form sent them. */
export async function saveContact(input: ContactInput) {
  await getDb().transaction(async tx => {
    const contact = { display: input.display, name: input.name || null, email: input.email || null }
    await tx
      .insert(siteContact)
      .values({ id: 1, ...contact })
      .onConflictDoUpdate({ target: siteContact.id, set: { ...contact, updatedAt: new Date() } })
    await tx.delete(socialLinks)
    if (input.socialLinks.length) {
      await tx.insert(socialLinks).values(
        input.socialLinks.map((link, position) => ({
          network: link.network,
          handle: link.handle || null,
          url: link.url,
          visible: link.visible,
          position,
        })),
      )
    }
  })
}
