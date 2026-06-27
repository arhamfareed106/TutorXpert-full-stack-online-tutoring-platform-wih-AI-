import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectPostgreSQL, connectMongoDB, connectRedis, getMockDB } from './db/mockData.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

// Get mock database
const mockDB = getMockDB();

// ==================== MOCK API ROUTES ====================

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role } = req.body;
  const newUser = {
    user_id: `user-${Date.now()}`,
    email,
    name,
    role: role || 'learner',
    profile_pic: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    created_at: new Date(),
  };
  mockDB.users.push(newUser);
  res.json({
    success: true,
    message: 'User registered successfully',
    user: { ...newUser, password: undefined },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = mockDB.users.find(u => u.email === email);
  
  if (user) {
    res.json({
      success: true,
      message: 'Login successful',
      user: { ...user, password: undefined },
      token: 'mock-jwt-token-' + Date.now(),
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: mockDB.users[0],
  });
});

// Subject routes
app.get('/api/subjects', (req, res) => {
  res.json({
    success: true,
    subjects: mockDB.subjects,
    total: mockDB.subjects.length,
  });
});

app.get('/api/subjects/:id', (req, res) => {
  const subject = mockDB.subjects.find(s => s.subject_id === req.params.id);
  if (subject) {
    res.json({ success: true, subject });
  } else {
    res.status(404).json({ success: false, message: 'Subject not found' });
  }
});

// Tutor routes
app.get('/api/tutors', (req, res) => {
  const { subject, minRate, maxRate, language, rating } = req.query;
  let filteredTutors = [...mockDB.tutors];

  if (subject) {
    filteredTutors = filteredTutors.filter(t => t.subjects.includes(subject));
  }
  if (minRate) {
    filteredTutors = filteredTutors.filter(t => t.hourly_rate >= parseFloat(minRate));
  }
  if (maxRate) {
    filteredTutors = filteredTutors.filter(t => t.hourly_rate <= parseFloat(maxRate));
  }
  if (language) {
    filteredTutors = filteredTutors.filter(t => t.languages.includes(language));
  }
  if (rating) {
    filteredTutors = filteredTutors.filter(t => t.rating >= parseFloat(rating));
  }

  res.json({
    success: true,
    tutors: filteredTutors,
    total: filteredTutors.length,
  });
});

app.get('/api/tutors/:id', (req, res) => {
  const tutor = mockDB.tutors.find(t => t.user_id === req.params.id);
  if (tutor) {
    res.json({
      success: true,
      tutor: {
        ...tutor,
        bio: tutor.introduction,
        education: ['Bachelor of Science in Education', 'Certified Teacher'],
        availability: [
          { day: 'Monday', slots: ['09:00', '10:00', '14:00', '15:00'] },
          { day: 'Tuesday', slots: ['09:00', '10:00', '14:00', '15:00'] },
          { day: 'Wednesday', slots: ['09:00', '10:00', '14:00', '15:00'] },
        ],
        reviews: [
          {
            student_name: 'John Doe',
            rating: 5,
            comment: 'Excellent tutor! Very patient and knowledgeable.',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            student_name: 'Jane Smith',
            rating: 5,
            comment: 'Great teaching style. Highly recommend!',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    });
  } else {
    res.status(404).json({ success: false, message: 'Tutor not found' });
  }
});

// Match/Recommendation routes
app.get('/api/match/recommendations/:learnerId', (req, res) => {
  res.json({
    success: true,
    recommendations: mockDB.tutors.slice(0, 5).map(tutor => ({
      tutor,
      matchScore: Math.random() * 0.3 + 0.7, // 70-100%
      reasons: [
        'Matches your learning style',
        'Highly rated by students',
        'Experience in your subject area',
      ],
    })),
  });
});

// Booking routes
app.get('/api/bookings', (req, res) => {
  res.json({
    success: true,
    bookings: mockDB.bookings,
    total: mockDB.bookings.length,
  });
});

app.post('/api/bookings', (req, res) => {
  const newBooking = {
    booking_id: `booking-${Date.now()}`,
    ...req.body,
    status: 'pending',
    created_at: new Date(),
  };
  mockDB.bookings.push(newBooking);
  res.json({
    success: true,
    message: 'Booking created successfully',
    booking: newBooking,
  });
});

// Session routes
app.get('/api/sessions', (req, res) => {
  res.json({
    success: true,
    sessions: mockDB.sessions,
    total: mockDB.sessions.length,
  });
});

app.get('/api/sessions/:id', (req, res) => {
  const session = mockDB.sessions.find(s => s.session_id === req.params.id);
  if (session) {
    res.json({ success: true, session });
  } else {
    res.json({
      success: true,
      session: {
        session_id: req.params.id,
        title: 'Math Tutoring Session',
        status: 'active',
        meeting_url: `https://meet.jit.si/tutorxpert-${req.params.id}`,
      },
    });
  }
});

// Progress routes
app.get('/api/progress/:userId', (req, res) => {
  res.json({
    success: true,
    progress: {
      totalHours: 24.5,
      completedSessions: 12,
      upcomingSessions: 3,
      subjects: [
        { name: 'Mathematics', hours: 10, progress: 65 },
        { name: 'Programming', hours: 8, progress: 45 },
        { name: 'English', hours: 6.5, progress: 80 },
      ],
      recentActivity: [
        { date: new Date(), activity: 'Completed Math session', type: 'session' },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), activity: 'Quiz scored 85%', type: 'quiz' },
      ],
    },
  });
});

// Community routes
app.get('/api/community/posts', (req, res) => {
  res.json({
    success: true,
    posts: [
      {
        post_id: 'post-1',
        author: 'John Doe',
        title: 'Tips for learning calculus',
        content: 'Here are my top tips...',
        likes: 24,
        comments: 5,
        created_at: new Date(),
      },
    ],
  });
});

// Analytics routes
app.get('/api/analytics/student/:userId', (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalSessions: 12,
      totalHours: 24.5,
      averageRating: 4.8,
      subjectBreakdown: [
        { subject: 'Math', hours: 10, sessions: 5 },
        { subject: 'Programming', hours: 8, sessions: 4 },
        { subject: 'English', hours: 6.5, sessions: 3 },
      ],
    },
  });
});

app.get('/api/analytics/tutor/:userId', (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalSessions: 150,
      totalStudents: 45,
      averageRating: 4.9,
      earnings: {
        today: 120,
        thisWeek: 850,
        thisMonth: 3400,
      },
    },
  });
});

// Notifications routes
app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    notifications: [
      {
        id: 'notif-1',
        type: 'booking',
        message: 'New booking request from Sarah',
        read: false,
        created_at: new Date(),
      },
      {
        id: 'notif-2',
        type: 'message',
        message: 'New message from Mike',
        read: false,
        created_at: new Date(Date.now() - 60 * 60 * 1000),
      },
    ],
  });
});

// Users routes
app.get('/api/users/:id', (req, res) => {
  const user = mockDB.users.find(u => u.user_id === req.params.id);
  if (user) {
    res.json({ success: true, user: { ...user, password: undefined } });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

app.put('/api/users/:id', (req, res) => {
  const userIndex = mockDB.users.findIndex(u => u.user_id === req.params.id);
  if (userIndex !== -1) {
    mockDB.users[userIndex] = { ...mockDB.users[userIndex], ...req.body };
    res.json({
      success: true,
      message: 'User updated',
      user: { ...mockDB.users[userIndex], password: undefined },
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Socket.IO setup for real-time features
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start server without database connections
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to mock databases
    await connectPostgreSQL();
    await connectMongoDB();
    await connectRedis();
    
    httpServer.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 TutorXpert Backend (MOCK MODE) running!');
      console.log('='.repeat(60));
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
      console.log(`💾 Database: Mock data (no external DB required)`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };
