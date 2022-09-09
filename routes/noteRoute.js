import express from 'express'
import * as noteController from '../controllers/noteController.js'
import { verifyJwt } from '../middleware/verifyJwt.js'

const router = express.Router()

router.use(verifyJwt)

router
  .route('/')
  .get(noteController.getAllNotes)
  .post(noteController.createNewNote)
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote)

export default router
