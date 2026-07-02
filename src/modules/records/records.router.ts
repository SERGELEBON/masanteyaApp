import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { upload } from '../../shared/middleware/upload'
import { RecordsController } from './records.controller'
import {
  createRecordSchema,
  updateRecordSchema,
  getRecordsQuerySchema,
  shareRecordSchema,
} from './records.schema'

const router = Router()

router.post('/', authenticate, upload.array('files', 5), validate(createRecordSchema), RecordsController.createRecord)
router.get('/', authenticate, validate(getRecordsQuerySchema), RecordsController.getRecords)
router.get('/:id', authenticate, RecordsController.getRecord)
router.put('/:id', authenticate, validate(updateRecordSchema), RecordsController.updateRecord)
router.delete('/:id', authenticate, RecordsController.deleteRecord)
router.post('/:id/share', authenticate, validate(shareRecordSchema), RecordsController.shareRecord)
router.post('/:id/files', authenticate, upload.array('files', 5), RecordsController.uploadFiles)

export default router
