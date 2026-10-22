import { asc } from 'drizzle-orm'

import { getDb } from '../client'
import { siteContact, siteContactTranslations, socialLinks } from '../schema'

/** Same contract as the Strapi `getAbout`: contact data and social links in one `About`. */
export async function getAboutFromDb(): Promise<About | undefined> {
  const db = getDb()
  const [contact] = await db.select().from(siteContact)
  if (!contact) {
    return undefined
  }
  const links = await db.select().from(socialLinks).orderBy(asc(socialLinks.position))
  const descriptions = await db.select().from(siteContactTranslations)
  const social = Object.fromEntries(
    links
      .filter(link => link.visible)
      .flatMap(link => [
        [link.network, link.handle ?? undefined],
        [`${link.network}Url`, link.url],
      ]),
  )

  return {
    id: 1,
    display: contact.display,
    name: contact.name ?? undefined,
    email: contact.email ?? undefined,
    ...social,
    // Strapi's default locale was English, and the site never asked for another.
    description: descriptions.find(d => d.locale === 'en')?.description || undefined,
    createdAt: contact.updatedAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
    locale: 'en',
  }
}
