import bcrypt from 'bcryptjs'
import { env } from '../../config/env'

export class HashHelper {
  static async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, env.BCRYPT_ROUNDS)
  }

  static async compare(value: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(value, hash)
  }
}
