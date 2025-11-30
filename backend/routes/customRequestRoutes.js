import express from 'express'

// This route file was disabled — custom request feature removed.
// All endpoints will return 410 Gone to indicate removal.
const router = express.Router()

router.use((req, res) => {
  res.status(410).json({ message: 'Custom request feature has been removed' })
})

export default router
