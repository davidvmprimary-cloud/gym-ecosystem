import 'server-only'
import prisma from '@/lib/prisma/client'
import { Prisma } from '@prisma/client'

export const sessionRepository = {
  async getLastSessionBySplit(userId: string, splitId: string) {
    return prisma.session.findFirst({
      where: { userId, splitId },
      orderBy: { date: 'desc' },
      include: {
        sets: {
          include: { exercise: true },
          orderBy: [{ exercise: { order: 'asc' } }, { setNumber: 'asc' }]
        }
      }
    })
  },

  async getLastTrainedSplit(userId: string) {
    return prisma.session.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { split: true }
    })
  },

  async createSession(data: Prisma.SessionCreateInput) {
    return prisma.session.create({ data, include: { sets: true } })
  },

  async updateSessionVolume(sessionId: string, totalVolume: number, progressPct: number) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { totalVolume, progressPct }
    })
  }
}
