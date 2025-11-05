# TalkItOut

An AI-powered support system for Singapore students (ages 10-19) that helps with academic stress, time management, goals, and mental health reflection.

## Features

### For Students
- 💬 **AI Chat Companion** - Supportive, non-clinical study companion powered by Google Gemini
- 🎯 **Pomodoro Focus Timer** - Interactive focus sessions with breathing exercises
- ✅ **Task Management** - Kanban-style task board with priorities and due dates
- ❤️ **Daily Check-ins** - Mood tracking with sentiment analysis and trend visualization
- 📊 **Progress Dashboard** - Streaks, badges, and insights
- 🧘 **Wellness Activities** - Box breathing, grounding exercises, thought reframing

### For Counselors
- 📊 **Dashboard** - Aggregated metrics and student engagement
- ⚠️ **Risk Detection** - AI-powered sentiment analysis and risk flagging
- 👥 **Student Management** - View and monitor student progress
- 📈 **Analytics** - Mood trends, session data, and intervention tracking

### Privacy & Safety
- 🔒 **PDPA/GDPR Compliant** - Pseudonymization of PII before external API calls
- 🚨 **Crisis Detection** - Automatic flagging of high-severity messages
- 📦 **Data Export** - Full data export in JSON format
- 🗑️ **Right to Delete** - Complete account and data deletion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| UI/Motion | Framer Motion + Recharts |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Realtime | Socket.IO |
| AI | Google Gemini (gemini-pro) |
| Auth | JWT (access + refresh tokens) |
| Security | Helmet, CORS, Rate Limiting |

## Project Structure

```
talkitout/
├── apps/
│   ├── api/          # Express backend
│   ├── web/          # React frontend
│   └── mobile/       # Expo React Native (future)
├── packages/
│   ├── ui/           # Design system components
│   └── lib/          # Shared utilities & types
├── docs/             # Documentation
│   ├── architecture.md
│   ├── safety-playbook.md
│   └── api.yaml
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Docker & Docker Compose (optional)
- Google Gemini API key (free tier available)

### 1. Clone and Install

```bash
git clone <repository-url>
cd TalkItOut
npm install
```

### 2. Configure Environment

```bash
# Copy example env files
cp .env.example .env
cp apps/web/.env.example apps/web/.env

# Edit .env and add your Google Gemini API key
# Get free API key from: https://makersuite.google.com/app/apikey
# GEMINI_API_KEY=AIza...
```

### 3. Start with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Wait for services to start, then seed the database
npm run seed

# View logs
docker-compose logs -f api
```

**Access:**
- Frontend: http://localhost:5173
- API: http://localhost:4000
- Mongo Express: http://localhost:8081 (admin/admin123)

### 4. Or Start Locally

```bash
# Terminal 1: Start MongoDB
docker-compose up mongo -d

# Terminal 2: Start API
npm run dev:api

# Terminal 3: Start Web
npm run dev:web

# Terminal 4: Seed database
npm run seed
```

## Demo Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Student | weijie@student.sg | password123 |
| Student | priya@student.sg | password123 |
| Counselor | counselor@talkitout.sg | password123 |

## Development

```bash
# Run all tests
npm test

# Lint code
npm run lint

# Build for production
npm run build

# Start production
npm start
```

## Key Features Demo

### AI Chat with Risk Detection
1. Login as a student
2. Navigate to Chat
3. Send message: "I'm feeling really overwhelmed"
4. AI responds with supportive, non-clinical guidance
5. Sentiment analyzed automatically
6. If severity ≥ 3, crisis message prepended and flag created

### Pomodoro Focus Session
1. Go to Focus page
2. Click "Start Focus Session"
3. See animated breathing circle and countdown timer
4. Pause/resume/stop functionality
5. Automatic break cycles
6. Session tracked and streak updated

### Counselor Dashboard
1. Login as counselor
2. View aggregated metrics
3. See open risk flags with severity badges
4. Access student details and message context

## API Documentation

See `docs/api.yaml` for full OpenAPI 3.1 specification.

**Base URL:** `http://localhost:4000`

**Key Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /chat/message` - Send message to AI
- `GET /chat/history` - Get conversation history
- `POST /tasks` - Create task
- `POST /checkins` - Log mood check-in
- `POST /pomodoro/start` - Start focus session
- `GET /risk/flags` - Get risk flags (counselor)
- `GET /metrics/aggregate` - Get metrics (counselor)

## Architecture

See `docs/architecture.md` for detailed architecture documentation.

**Key Design Decisions:**
- Monorepo for code sharing
- JWT with refresh tokens for security
- Socket.IO for realtime features
- Pseudonymization before external API calls
- Sentiment analysis on all user messages
- Automatic risk flagging with severity levels

## Safety & Ethics

See `docs/safety-playbook.md` for comprehensive safety guidelines.

**Core Principles:**
- Non-clinical language only
- Never diagnose or provide therapy
- Encourage reaching out to trusted adults
- Crisis resources always visible
- Transparent about AI limitations
- Guardian consent required for under-18

## Testing

```bash
# API tests
npm run test --workspace=@talkitout/api

# Web tests (when implemented)
npm run test --workspace=@talkitout/web
```

## Production Deployment

1. Set strong `JWT_SECRET`
2. Configure production MongoDB
3. Set `ALLOWED_ORIGINS` to your domain
4. Use environment-specific `.env` files
5. Enable HTTPS/TLS
6. Set up monitoring and logging
7. Configure backup strategy
8. Review security headers

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

[Add your license here]

## Support

For questions or issues:
- GitHub Issues: [repository-url]/issues
- Email: support@talkitout.sg

## Acknowledgments

Built for Singapore students with care and attention to mental health best practices.

**Crisis Resources:**
- Emergency: 999
- Samaritans of Singapore: 1767
- SOS CareText: 9151 1767

---

**Note:** TalkItOut is a support tool, not a crisis service or medical provider. Always seek professional help for serious concerns.
