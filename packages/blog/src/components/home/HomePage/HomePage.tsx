import { HeaderImage } from '../HeaderImage'

export function HomePage() {
  return (
    <HeaderImage
      imgSrc="https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=868&q=80"
      date={new Date()}
      categories={['travel', 'lifestyle']}
      title="Vacaciones en el Algarve. Una experiencia inolvidable."
      subtitle="Un viaje por el Algarve y sus playas, descubriendo la paz del Atlántico. Sus gentes y su gastronomía de cerca."
    />
  )
}
