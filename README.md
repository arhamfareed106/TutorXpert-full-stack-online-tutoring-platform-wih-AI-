# TutorXpert - Peer-to-Peer Tutoring Platform

**Connect learners and tutors with smart match, flexible sessions & deep insights.**

## 🚀 Features

### Core Features
- **AI-Powered Tutor Matching** - Intelligent matching based on learning goals, style, and performance
- **Flexible Scheduling** - Book sessions at convenient times with real-time availability
- **Interactive Session Tools** - Shared whiteboard, code editor, and real-time collaboration
- **Progress Analytics** - Track learning progress with detailed insights
- **Community Q&A** - Ask questions and share knowledge with the community
- **Gamification** - Badges, streaks, and achievements to motivate learners

### For Learners
- Browse and search expert tutors
- AI-powered tutor recommendations
- Easy booking and scheduling
- Interactive video sessions
- Progress tracking and analytics
- Community support

### For Tutors
- Create detailed tutor profile
- Set availability and pricing
- Manage bookings and sessions
- Track earnings and performance
- Build reputation with reviews
- Student progress insights

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Socket.io Client** for real-time features
- **Recharts** for analytics
- **React Calendar** for scheduling

### Backend
- **Node.js** with Express
- **PostgreSQL** for relational data
- **MongoDB** for session data
- **Redis** for caching
- **Socket.io** for WebSockets
- **JWT** for authentication

### AI Microservice
- **Python** with FastAPI
- **Scikit-learn** for ML
- **NumPy/Pandas** for data processing

## 📁 Project Structure

```
tutorxpert/
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── socket/
│   │   └── index.js
│   └── package.json
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   └── package.json
├── ai-service/        # Python AI microservice
│   ├── src/
│   │   └── main.py
│   └── requirements.txt
└── package.json       # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- PostgreSQL 14+
- MongoDB 5+
- Redis 7+

### Installation

1. **Clone the repository**
```bash
cd tutorxpert
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install AI service dependencies (Python)
cd ../ai-service
pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend
cp frontend/.env.example frontend/.env

# AI Service
# Configure in ai-service/src/main.py
```

4. **Set up databases**
```bash
# PostgreSQL
createdb tutorxpert

# MongoDB
mongosh --eval "use tutorxpert"

# Redis
redis-server
```

5. **Run database migrations**
```bash
cd backend
npm run migrate
npm run seed
```

### Running the Application

**Option 1: Run all services together**
```bash
# From root directory
npm run dev
```

**Option 2: Run services separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - AI Service:
```bash
cd ai-service
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **API Docs**: http://localhost:5000/api-docs

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Tutors
- `GET /api/tutors` - List all tutors
- `GET /api/tutors/:id` - Get tutor details
- `POST /api/tutors/profile` - Create tutor profile

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id` - Update booking

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `POST /api/sessions/:id/tools` - Save session tools

### Match
- `GET /api/match/recommend` - Get tutor recommendations
- `POST /api/match/:id/accept` - Accept match

### Community
- `GET /api/community` - List posts
- `POST /api/community` - Create post
- `POST /api/community/:id/reply` - Add reply

## 🎨 Design

The UI design is inspired by Preply with:
- Clean, modern interface
- Intuitive navigation
- Responsive design
- Accessible components
- Consistent color scheme

## 🔒 Security

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- CORS protection
- HTTPS in production

## 📊 Database Schema

### PostgreSQL Tables
- users
- subjects
- tutor_profiles
- learner_profiles
- matches
- bookings
- sessions
- progress_records
- reviews
- community_posts
- notifications
- learning_paths
- badges

### MongoDB Collections
- session_tools
- session_activity
- session_chat
- analytics_events

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend (Render/AWS)
```bash
cd backend
npm run build
# Deploy to your preferred platform
```

## 👥 Demo Accounts

After running `npm run seed`:

**Learner:**
- Email: student@example.com
- Password: learner123

**Tutor:**
- Email: sarah.johnson@tutorxpert.com
- Password: tutor123

**Admin:**
- Email: admin@tutorxpert.com
- Password: admin123

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@tutorxpert.com or join our Discord community.

---

Built with ❤️ by the TutorXpert Team
"# TutorXpert-full-stack-online-tutoring-platform-wih-AI-" 
