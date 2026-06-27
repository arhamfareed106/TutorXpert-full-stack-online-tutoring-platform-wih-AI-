// Mock database for development without PostgreSQL, MongoDB, Redis
import { EventEmitter } from 'events';

// Mock data storage
const mockDB = {
  users: [
    {
      user_id: 'user-1',
      email: 'demo@student.com',
      password: '$2a$10$demoHashedPassword',
      name: 'Demo Student',
      role: 'learner',
      profile_pic: 'https://i.pravatar.cc/150?img=12',
      created_at: new Date(),
    },
    {
      user_id: 'user-2',
      email: 'demo@tutor.com',
      password: '$2a$10$demoHashedPassword',
      name: 'Demo Tutor',
      role: 'tutor',
      profile_pic: 'https://i.pravatar.cc/150?img=8',
      created_at: new Date(),
    }
  ],
  subjects: [
    { subject_id: 'math-1', name: 'Mathematics', category: 'STEM', icon: '📐', tutor_count: 1245 },
    { subject_id: 'science-1', name: 'Science', category: 'STEM', icon: '🔬', tutor_count: 892 },
    { subject_id: 'english-1', name: 'English', category: 'Language', icon: '📚', tutor_count: 2134 },
    { subject_id: 'programming-1', name: 'Programming', category: 'STEM', icon: '💻', tutor_count: 1567 },
    { subject_id: 'spanish-1', name: 'Spanish', category: 'Language', icon: '🇪🇸', tutor_count: 1823 },
    { subject_id: 'french-1', name: 'French', category: 'Language', icon: '🇫🇷', tutor_count: 1456 },
  ],
  tutors: [
    {
      user_id: 'tutor-1',
      name: 'Sarah Johnson',
      profile_pic: 'https://i.pravatar.cc/150?img=1',
      rating: 4.9,
      total_reviews: 127,
      is_verified: true,
      subjects: ['math-1', 'science-1'],
      experience_years: 5,
      hourly_rate: 45,
      languages: ['English', 'Spanish'],
      introduction: 'Experienced math and science tutor passionate about helping students succeed.',
      total_sessions: 350,
      response_rate: 98,
    },
    {
      user_id: 'tutor-2',
      name: 'Mike Chen',
      profile_pic: 'https://i.pravatar.cc/150?img=3',
      rating: 4.8,
      total_reviews: 89,
      is_verified: true,
      subjects: ['programming-1', 'math-1'],
      experience_years: 8,
      hourly_rate: 60,
      languages: ['English', 'Mandarin'],
      introduction: 'Software engineer turned tutor. I make coding fun and accessible.',
      total_sessions: 280,
      response_rate: 95,
    },
    {
      user_id: 'tutor-3',
      name: 'Emma Wilson',
      profile_pic: 'https://i.pravatar.cc/150?img=5',
      rating: 4.7,
      total_reviews: 64,
      is_verified: false,
      subjects: ['english-1'],
      experience_years: 4,
      hourly_rate: 40,
      languages: ['English'],
      introduction: 'English literature graduate with a passion for teaching writing.',
      total_sessions: 180,
      response_rate: 92,
    },
  ],
  bookings: [],
  sessions: [],
  messages: [],
  notifications: [],
};

// Mock cache storage
const mockCache = new Map();

// Mock event emitter for real-time features
const mockEventBus = new EventEmitter();

// PostgreSQL Mock
export async function connectPostgreSQL() {
  console.log('✅ PostgreSQL connected (MOCK MODE)');
  return true;
}

export async function query(text, params) {
  console.log('Mock Query:', text.substring(0, 50) + '...');
  return { rows: [], rowCount: 0 };
}

export function getPool() {
  return {
    query,
    connect: async () => ({ query, release: () => {} }),
  };
}

// MongoDB Mock
export async function connectMongoDB() {
  console.log('✅ MongoDB connected (MOCK MODE)');
  return true;
}

// Redis Mock
export async function connectRedis() {
  console.log('✅ Redis connected (MOCK MODE)');
  return {
    on: () => {},
    connect: async () => {},
    setEx: async (key, ttl, value) => {
      mockCache.set(key, { value, expires: Date.now() + ttl * 1000 });
    },
    get: async (key) => {
      const item = mockCache.get(key);
      if (!item) return null;
      if (Date.now() > item.expires) {
        mockCache.delete(key);
        return null;
      }
      return item.value;
    },
    del: async (key) => mockCache.delete(key),
  };
}

export function getRedisClient() {
  return {
    setEx: async (key, ttl, value) => {
      mockCache.set(key, { value, expires: Date.now() + ttl * 1000 });
    },
    get: async (key) => {
      const item = mockCache.get(key);
      if (!item) return null;
      if (Date.now() > item.expires) {
        mockCache.delete(key);
        return null;
      }
      return item.value;
    },
    del: async (key) => mockCache.delete(key),
  };
}

export async function cacheSet(key, value, ttl = 3600) {
  mockCache.set(key, { value: JSON.stringify(value), expires: Date.now() + ttl * 1000 });
}

export async function cacheGet(key) {
  const item = mockCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    mockCache.delete(key);
    return null;
  }
  return JSON.parse(item.value);
}

export async function cacheDelete(key) {
  mockCache.delete(key);
}

// Mock data access functions
export function getMockDB() {
  return mockDB;
}

export function getMockEventBus() {
  return mockEventBus;
}

export default {
  connectPostgreSQL,
  connectMongoDB,
  connectRedis,
  query,
  getPool,
  getRedisClient,
  cacheSet,
  cacheGet,
  cacheDelete,
  getMockDB,
  getMockEventBus,
};
