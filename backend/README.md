# Intervexa Backend

Express.js REST API server for the AI Interview platform.

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory (you can copy `.env.example`):
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Port for the Express server (Frontend & Admin expect `5001`) | `5001` |
| `MONGO_URI` | MongoDB connection URI string | `mongodb://127.0.0.1:27017/ai-interview-app` or Atlas URI |
| `JWT_SECRET` | Secret key for JWT token signing | Random secure secret |
| `ADMIN_EMAIL` | Auto-seeded admin user email | `admin@intervexa.com` |
| `ADMIN_PASSWORD` | Auto-seeded admin user password | `Admin@12345` |
| `GEMINI_API_KEY` | Google Gemini API key for question generation & evaluations | Get from [Google AI Studio](https://aistudio.google.com/) |
| `JUDGE0_API_URL` | Judge0 remote or self-hosted endpoint | `https://judge0-ce.p.rapidapi.com` or `http://localhost:2358` |
| `JUDGE0_API_KEY` | RapidAPI key (if using RapidAPI Judge0) | RapidAPI Key |

### 3. Run the Server
```bash
# Development mode with Nodemon
npm run dev

# Production mode
npm start
```

