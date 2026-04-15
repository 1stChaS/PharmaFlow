import { Router } from 'express'
import authRoutes from './auth.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import userRoutes from './user.routes.js'
import patientRoutes from './patient.routes.js'
import prescriptionRoutes from './prescription.routes.js'
import deliveryAssignmentRoutes from './delivery-assignment.routes.js'
import reportRoutes from './report.routes.js'
import requestRoutes from './request.routes.js'

const router = Router()

router.get('/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
)

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/users', userRoutes)
router.use('/patients', patientRoutes)
router.use('/prescriptions', prescriptionRoutes)
router.use('/delivery-assignments', deliveryAssignmentRoutes)
router.use('/reports', reportRoutes)
router.use('/requests', requestRoutes)

export default router
