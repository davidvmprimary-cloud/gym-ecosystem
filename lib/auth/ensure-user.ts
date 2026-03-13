import prisma from '@/lib/prisma/client'

export async function ensureUserExists(userId: string, email: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { splits: true }
  })

  if (dbUser) return dbUser

  console.log(`User ${userId} missing in Prisma. Recreating...`)

  // Replicate signup logic for auto-healing
  return await prisma.user.create({
    data: {
      id: userId,
      email: email,
      splits: {
        create: [
          {
            name: 'Push',
            order: 1,
            exercises: {
              create: [
                { name: 'Press de Banca', order: 1 },
                { name: 'Press Militar', order: 2 },
                { name: 'Extensiones de Tríceps', order: 3 },
              ]
            }
          },
          {
            name: 'Pull',
            order: 2,
            exercises: {
              create: [
                { name: 'Dominadas', order: 1 },
                { name: 'Remo con Barra', order: 2 },
                { name: 'Curl de Bíceps', order: 3 },
              ]
            }
          },
          {
            name: 'Legs',
            order: 3,
            exercises: {
              create: [
                { name: 'Sentadilla', order: 1 },
                { name: 'Prensa', order: 2 },
                { name: 'Curl Femoral', order: 3 },
              ]
            }
          }
        ]
      }
    },
    include: {
      splits: {
        include: { exercises: true }
      }
    }
  })
}
