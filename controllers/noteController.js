import Note from '../models/note.js'
import User from '../models/user.js'
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean()

  if (!notes?.length) {
    return res.status(400).json({ message: 'No notes found' })
  }

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec()
      return { ...note, username: user?.username }
    }),
  )

  res.json(notesWithUser)
})

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { title, text, user } = req.body

  if (!user || !title || !text) {
    return res
      .status(400)
      .json({ message: 'Please provide all required fields' })
  }

  const duplicateNote = await Note.findOne({ title })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec()

  if (duplicateNote) {
    return res.status(409).json({ message: 'Note already exists' })
  }

  const note = await Note.create({ title, text, user })

  if (note) {
    return res.status(201).json({ message: 'Note created successfully' })
  } else {
    res
      .status(500)
      .json({ message: 'Something went wrong while creating note' })
  }
})

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body

  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res
      .status(400)
      .json({ message: 'Please provide all required fields' })
  }

  const note = await Note.findById(id).exec()

  if (!note) {
    return res.status(404).json({ message: 'Note not found' })
  }

  const duplicateNote = await Note.findOne({ title })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec()

  if (duplicateNote && duplicateNote._id.toString() !== id) {
    return res.status(409).json({ message: 'Note already exists' })
  }

  note.user = user
  note.title = title
  note.text = text
  note.completed = completed

  const updatedNote = await note.save()

  res.json(`'${updatedNote?.title}' updated`)
})

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body

  if (!id) {
    return res.status(400).json({ message: 'Please provide id' })
  }

  const _id = mongoose.Types.ObjectId(id)

  const note = await Note.findById(_id).exec()

  if (!note) {
    return res.status(404).json({ message: 'Note not found' })
  }

  const result = await Note.deleteOne()

  const reply = `Note '${result.title}' with ID ${result._id} deleted`

  res.json(reply)
})

export { getAllNotes, createNewNote, updateNote, deleteNote }
