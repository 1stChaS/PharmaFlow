import { Router } from 'express'
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  dispatchRequest,
} from '../controllers/request.controller.js'

const router = Router()

router.get('/', getAllRequests)
router.patch('/:id/approve', approveRequest)
router.patch('/:id/reject', rejectRequest)
router.patch('/:id/dispatch', dispatchRequest)

export default router