import { prisma } from '../../config/database'
import { StorageService } from '../../shared/services/storage.service'
import type {
  CreateRecordInput,
  UpdateRecordInput,
  GetRecordsQuery,
  ShareRecordInput,
} from './records.schema'

export class RecordsService {
  static async createRecord(patientId: string, data: CreateRecordInput, files?: Express.Multer.File[]) {
    const fileUrls: string[] = []

    if (files && files.length > 0) {
      for (const file of files) {
        const result = await StorageService.upload({
          folder: `records/${patientId}`,
          fileName: file.originalname,
          file: file.buffer,
          contentType: file.mimetype,
        })

        if (result) {
          fileUrls.push(result.url)
        }
      }
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId,
        type: data.type,
        title: data.title,
        doctorName: data.doctorName,
        hospital: data.hospital,
        summary: data.summary,
        date: new Date(data.date),
        fileUrls,
        tags: data.tags || [],
      },
    })

    return record
  }

  static async getRecords(patientId: string, query: GetRecordsQuery) {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: any = { patientId }

    if (query.type) {
      where.type = query.type
    }

    if (query.startDate || query.endDate) {
      where.date = {}
      if (query.startDate) where.date.gte = new Date(query.startDate)
      if (query.endDate) where.date.lte = new Date(query.endDate)
    }

    if (query.tags) {
      where.tags = { hasSome: query.tags.split(',') }
    }

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.medicalRecord.count({ where }),
    ])

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async getRecord(patientId: string, recordId: string) {
    const record = await prisma.medicalRecord.findFirst({
      where: {
        id: recordId,
        OR: [{ patientId }, { sharedWith: { has: patientId } }],
      },
    })

    if (!record) {
      throw new Error('Dossier médical introuvable')
    }

    return record
  }

  static async updateRecord(patientId: string, recordId: string, data: UpdateRecordInput) {
    const existing = await prisma.medicalRecord.findFirst({
      where: { id: recordId, patientId },
    })

    if (!existing) {
      throw new Error('Dossier médical introuvable')
    }

    const updateData: any = {}

    if (data.title) updateData.title = data.title
    if (data.doctorName) updateData.doctorName = data.doctorName
    if (data.hospital) updateData.hospital = data.hospital
    if (data.summary !== undefined) updateData.summary = data.summary
    if (data.date) updateData.date = new Date(data.date)
    if (data.tags) updateData.tags = data.tags

    const record = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: updateData,
    })

    return record
  }

  static async deleteRecord(patientId: string, recordId: string) {
    const record = await prisma.medicalRecord.findFirst({
      where: { id: recordId, patientId },
    })

    if (!record) {
      throw new Error('Dossier médical introuvable')
    }

    await prisma.medicalRecord.delete({
      where: { id: recordId },
    })

    return { message: 'Dossier médical supprimé avec succès' }
  }

  static async shareRecord(patientId: string, recordId: string, data: ShareRecordInput) {
    const record = await prisma.medicalRecord.findFirst({
      where: { id: recordId, patientId },
    })

    if (!record) {
      throw new Error('Dossier médical introuvable')
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        isShared: true,
        sharedWith: data.doctorIds,
      },
    })

    return updatedRecord
  }

  static async uploadFiles(patientId: string, recordId: string, files: Express.Multer.File[]) {
    const record = await prisma.medicalRecord.findFirst({
      where: { id: recordId, patientId },
    })

    if (!record) {
      throw new Error('Dossier médical introuvable')
    }

    const newFileUrls: string[] = []

    for (const file of files) {
      const result = await StorageService.upload({
        folder: `records/${patientId}`,
        fileName: file.originalname,
        file: file.buffer,
        contentType: file.mimetype,
      })

      if (result) {
        newFileUrls.push(result.url)
      }
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        fileUrls: [...record.fileUrls, ...newFileUrls],
      },
    })

    return updatedRecord
  }
}
