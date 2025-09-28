import express from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/notesController';
import { authenticate } from '../middleware/auth';
import { noteValidation } from '../utils/validation';

const router = express.Router();

router.get('/', authenticate, getNotes);
router.post('/', authenticate, noteValidation, createNote);
router.put('/:id', authenticate, noteValidation, updateNote);
router.delete('/:id', authenticate, deleteNote);

export default router;