import { prisma } from '../../config/database'
import { StorageService } from '../../shared/services/storage.service'
import type {
  CreateInsuranceInput,
  UpdateInsuranceInput,
  CheckCoverageInput,
} from './insurance.schema'

export class InsuranceService {
  static async createInsurance(patientId: string, data: CreateInsuranceInput, cardImage?: Express.Multer.File) {
    const existing = await prisma.insurance.findFirst({
      where: {
        memberNumber: data.memberNumber,
      },
    })

    if (existing) {
      throw new Error('Numéro de membre déjà enregistré')
    }

    let cardImageUrl: string | undefined

    if (cardImage) {
      const result = await StorageService.upload({
        folder: `insurance/${patientId}`,
        fileName: `card_${Date.now()}_${cardImage.originalname}`,
        file: cardImage.buffer,
        contentType: cardImage.mimetype,
      })

      if (result) {
        cardImageUrl = result.url
      }
    }

    const insurance = await prisma.insurance.create({
      data: {
        patientId,
        provider: data.provider,
        memberNumber: data.memberNumber,
        holderName: data.holderName,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        annualLimit: data.annualLimit,
        currency: data.currency,
        cardImageUrl,
      },
    })

    return insurance
  }

  static async getInsurances(patientId: string) {
    const insurances = await prisma.insurance.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    })

    return insurances
  }

  static async getInsurance(patientId: string, insuranceId: string) {
    const insurance = await prisma.insurance.findFirst({
      where: {
        id: insuranceId,
        patientId,
      },
    })

    if (!insurance) {
      throw new Error('Assurance introuvable')
    }

    return insurance
  }

  static async updateInsurance(patientId: string, insuranceId: string, data: UpdateInsuranceInput) {
    const existing = await prisma.insurance.findFirst({
      where: { id: insuranceId, patientId },
    })

    if (!existing) {
      throw new Error('Assurance introuvable')
    }

    const updateData: any = {}

    if (data.holderName) updateData.holderName = data.holderName
    if (data.validUntil) updateData.validUntil = new Date(data.validUntil)
    if (data.annualLimit !== undefined) updateData.annualLimit = data.annualLimit
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const insurance = await prisma.insurance.update({
      where: { id: insuranceId },
      data: updateData,
    })

    return insurance
  }

  static async deleteInsurance(patientId: string, insuranceId: string) {
    const insurance = await prisma.insurance.findFirst({
      where: { id: insuranceId, patientId },
    })

    if (!insurance) {
      throw new Error('Assurance introuvable')
    }

    await prisma.insurance.delete({
      where: { id: insuranceId },
    })

    return { message: 'Assurance supprimée avec succès' }
  }

  static async uploadCardImage(patientId: string, insuranceId: string, cardImage: Express.Multer.File) {
    const insurance = await prisma.insurance.findFirst({
      where: { id: insuranceId, patientId },
    })

    if (!insurance) {
      throw new Error('Assurance introuvable')
    }

    const result = await StorageService.upload({
      folder: `insurance/${patientId}`,
      fileName: `card_${Date.now()}_${cardImage.originalname}`,
      file: cardImage.buffer,
      contentType: cardImage.mimetype,
    })

    if (!result) {
      throw new Error("Erreur lors de l'upload de l'image")
    }

    const updated = await prisma.insurance.update({
      where: { id: insuranceId },
      data: { cardImageUrl: result.url },
    })

    return updated
  }

  static async checkCoverage(patientId: string, insuranceId: string, data: CheckCoverageInput) {
    const insurance = await prisma.insurance.findFirst({
      where: {
        id: insuranceId,
        patientId,
        isActive: true,
      },
    })

    if (!insurance) {
      throw new Error('Assurance introuvable ou inactive')
    }

    const now = new Date()
    if (now < insurance.validFrom || now > insurance.validUntil) {
      return {
        covered: false,
        reason: 'Assurance expirée ou pas encore valide',
        remainingAmount: 0,
      }
    }

    const remainingAmount = Number(insurance.annualLimit) - Number(insurance.usedAmount)

    if (remainingAmount < data.amount) {
      return {
        covered: false,
        reason: 'Limite annuelle dépassée',
        remainingAmount,
      }
    }

    return {
      covered: true,
      reason: 'Couverture disponible',
      remainingAmount,
    }
  }

  static async recordUsage(patientId: string, insuranceId: string, amount: number) {
    const insurance = await prisma.insurance.findFirst({
      where: { id: insuranceId, patientId },
    })

    if (!insurance) {
      throw new Error('Assurance introuvable')
    }

    const updated = await prisma.insurance.update({
      where: { id: insuranceId },
      data: {
        usedAmount: {
          increment: amount,
        },
      },
    })

    return updated
  }
}