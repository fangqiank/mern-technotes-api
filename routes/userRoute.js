import express from 'express'
import * as userController from '../controllers/userController.js'
import { verifyJwt } from '../middleware/verifyJwt.js'

const router = express.Router()

router.use(verifyJwt)

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

export default router
