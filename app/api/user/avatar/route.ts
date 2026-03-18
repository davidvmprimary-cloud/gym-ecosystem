import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Check if user already has an avatar to delete it later or just overwrite path
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true }
    })

    const { data, error: uploadError } = await supabase.storage
      .from('profiles') // Let's use 'profiles' as bucket name
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    // 3. Update Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: publicUrl }
    })

    // 4. (Optional) Delete old file if exists and is in our storage
    if (dbUser?.avatarUrl && dbUser.avatarUrl.includes('/storage/v1/object/public/profiles/')) {
      const oldPath = dbUser.avatarUrl.split('/profiles/').pop()
      if (oldPath) {
        await supabase.storage.from('profiles').remove([oldPath])
      }
    }

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Server error during upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
