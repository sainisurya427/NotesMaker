import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../utils/api';
import type { Note } from '../types';
import { Plus, Trash2, Edit3, LogOut, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async (): Promise<void> => {
    try {
      const notesData = await notesAPI.getNotes();
      setNotes(notesData);
    } catch (error: any) {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    try {
      if (editingNote) {
        const updatedNote = await notesAPI.updateNote(editingNote._id, formData);
        setNotes(notes.map(note => note._id === updatedNote._id ? updatedNote : note));
        setEditingNote(null);
      } else {
        const newNote = await notesAPI.createNote(formData);
        setNotes([newNote, ...notes]);
      }
      setFormData({ title: '', content: '' });
      setShowNoteForm(false);
    } catch (error: any) {
      setError('Failed to save note');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesAPI.deleteNote(id);
      setNotes(notes.filter(note => note._id !== id));
    } catch (error: any) {
      setError('Failed to delete note');
    }
  };

  const startEdit = (note: Note): void => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setShowNoteForm(true);
  };

  const cancelEdit = (): void => {
    setEditingNote(null);
    setFormData({ title: '', content: '' });
    setShowNoteForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <User className="h-8 w-8 text-primary-500" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Welcome, {user?.name}!</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Add Note Button */}
          {!showNoteForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowNoteForm(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-5 w-5" />
                Add New Note
              </button>
            </div>
          )}

          {/* Note Form */}
          {showNoteForm && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                  >
                    {editingNote ? 'Update Note' : 'Create Note'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notes Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                <div className="mt-4 text-sm text-gray-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {notes.length === 0 && !showNoteForm && (
            <div className="text-center py-12">
              <p className="text-gray-500">No notes yet. Create your first note!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;