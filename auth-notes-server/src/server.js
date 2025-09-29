import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from client dist folder (Correct Path)
app.use(express.static(path.join(__dirname, '../../auth-notes-client/dist')));

// In-memory storage
const users = [];
const notes = [];
let nextUserId = 1;
let nextNoteId = 1;

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Full-stack server is running!', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Signup endpoint
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password, dateOfBirth } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }
    
    // Create new user
    const newUser = {
      id: nextUserId++,
      name,
      email,
      dateOfBirth,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Generate token
    const token = 'jwt-token-' + Math.random().toString(36).substr(2, 9);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        dateOfBirth: newUser.dateOfBirth
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = 'jwt-token-' + Math.random().toString(36).substr(2, 9);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
app.get('/api/auth/profile', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Return first user for demo
    const user = users[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Notes endpoints
app.get('/api/notes', (req, res) => {
  try {
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
});

app.post('/api/notes', (req, res) => {
  try {
    const { title, content } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const newNote = {
      _id: nextNoteId++,
      title,
      content,
      user: 'user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    
    res.status(201).json(newNote);
    
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error creating note' });
  }
});

app.put('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const noteIndex = notes.findIndex(note => note._id == id);
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    notes[noteIndex] = {
      ...notes[noteIndex],
      title,
      content,
      updatedAt: new Date().toISOString()
    };
    
    res.json(notes[noteIndex]);
    
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error updating note' });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const noteIndex = notes.findIndex(note => note._id == id);
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    notes.splice(noteIndex, 1);
    
    res.json({ message: 'Note deleted successfully' });
    
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error deleting note' });
  }
});

// Serve React app for all other routes (Correct Path)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../auth-notes-client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Full-stack server running on port ${PORT}`); 
  console.log(`Frontend: http://localhost:${PORT}`);
});