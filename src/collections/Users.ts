import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    useAsTitle: 'email',
    group: 'Ajustes',
    description:
      'Las personas que pueden entrar a este panel. Cada una entra con su correo y su contraseña, y puede cambiar todo el contenido. No se ven en la página.',
  },
  auth: true,
  fields: [],
}
