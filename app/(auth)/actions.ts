'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid login credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/workout')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Supabase signup error:', error)
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (!authData.user) {
    redirect('/signup?error=Could not create user')
  }

  // Creación de usuario en Prisma + Splits por defecto
  try {
    await prisma.user.create({
      data: {
        id: authData.user.id,
        email: data.email,
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
      }
    })
  } catch (dbError) {
    console.error('Error creating user profile:', dbError)
    // Here we should probably handle partial faillures, but for MVP:
  }

  revalidatePath('/', 'layout')
  redirect('/workout')
}
