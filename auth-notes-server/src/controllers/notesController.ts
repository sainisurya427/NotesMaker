import { Response } from 'express';
import Note from '../models/Note';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notes = await Note.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, content } = req.body;

    const note = new Note({
      title,
      content,
      user: req.user!._id,
    });

    await note.save();

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error creating note' });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { title, content } = req.body;

    const note = await Note.findOne({ _id: id, user: req.user!._id });

    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    note.title = title;
    note.content = content;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error updating note' });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const note = await Note.findOne({ _id: id, user: req.user!._id });

    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    await Note.deleteOne({ _id: id });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error deleting note' });
  }
};