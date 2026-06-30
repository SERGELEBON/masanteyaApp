import { createClient } from '@supabase/supabase-js'
import { env } from '../../config/env'
import { logger } from '../../config/logger'

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

export interface UploadFileParams {
  bucket?: string
  folder: string
  fileName: string
  file: Buffer
  contentType: string
}

export interface FileUploadResult {
  url: string
  path: string
}

export class StorageService {
  static async upload({
    bucket = env.SUPABASE_STORAGE_BUCKET,
    folder,
    fileName,
    file,
    contentType,
  }: UploadFileParams): Promise<FileUploadResult | null> {
    try {
      const timestamp = Date.now()
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${folder}/${timestamp}_${sanitizedFileName}`

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        contentType,
        upsert: false,
      })

      if (error) {
        logger.error('Storage upload error:', error)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path,
      }
    } catch (error) {
      logger.error('Storage service error:', error)
      return null
    }
  }

  static async delete(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])

      if (error) {
        logger.error('Storage delete error:', error)
        return false
      }

      return true
    } catch (error) {
      logger.error('Storage delete service error:', error)
      return false
    }
  }

  static async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

      if (error) {
        logger.error('Storage signed URL error:', error)
        return null
      }

      return data.signedUrl
    } catch (error) {
      logger.error('Storage signed URL service error:', error)
      return null
    }
  }
}