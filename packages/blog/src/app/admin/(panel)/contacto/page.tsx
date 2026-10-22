import { ContactForm } from '@blog/components/admin/contact/ContactForm'
import { getContactForAdmin } from '@blog/db/queries/admin/contact'

export default async function ContactPage() {
  return <ContactForm contact={await getContactForAdmin()} />
}
