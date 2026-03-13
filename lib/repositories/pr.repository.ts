import 'server-only'
import prisma from '@/lib/prisma/client'
import { Prisma } from '@prisma/client'

export const prRepository = {
  async getCurrentPR(userId: string, exerciseId: string, recordType: string) {
    return prisma.personalRecord.findFirst({
      where: { userId, exerciseId, recordType },
      orderBy: { value: 'desc' }
    })
  },

  async createPR(data: Prisma.PersonalRecordUncheckedCreateInput) {
    return prisma.personalRecord.create({ data })
  },

  async checkAndRegisterPR(params: {
    userId: string
    exerciseId: string
    setId: string
    sessionId: string
    weightKg: number
    reps: number
    volume: number
    estimated1rm: number
  }) {
    const types = [
      { type: 'volume', value: params.volume },
      { type: 'weight', value: params.weightKg },
      { type: 'estimated1rm', value: params.estimated1rm },
    ]

    const newPRs: string[] = []

    for (const { type, value } of types) {
      const current = await prRepository.getCurrentPR(params.userId, params.exerciseId, type)
      if (!current || value > current.value) {
        await prRepository.createPR({
          userId: params.userId,
          exerciseId: params.exerciseId,
          recordType: type,
          value,
          setId: params.setId,
          sessionId: params.sessionId,
        })
        newPRs.push(type)
      }
    }

    return newPRs
  }
}
