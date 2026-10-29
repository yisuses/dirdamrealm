import { LuFileText, LuFolder, LuHouse, LuImage, LuMail, LuMessageSquare, LuUser, LuUsers } from 'react-icons/lu'

/** The panel's sections, in menu order. Shared by the client menu and the server home page. */
export const adminSections = [
  { href: '/admin/', label: 'Inicio', icon: LuHouse },
  { href: '/admin/entradas/', label: 'Entradas', icon: LuFileText },
  { href: '/admin/comentarios/', label: 'Comentarios', icon: LuMessageSquare },
  { href: '/admin/imagenes/', label: 'Imágenes', icon: LuImage },
  { href: '/admin/categorias/', label: 'Categorías', icon: LuFolder },
  { href: '/admin/contacto/', label: 'Contacto y redes', icon: LuMail },
  { href: '/admin/autores/', label: 'Autores', icon: LuUser },
  { href: '/admin/usuarios/', label: 'Usuarios', icon: LuUsers },
]
